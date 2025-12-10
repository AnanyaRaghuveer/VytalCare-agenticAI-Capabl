/**
 * Optimized LangGraph-Style Flow for Health Navigator
 * 
 * Reduces LLM calls from 5-6 per message to 1-2 calls (60-70% cost reduction)
 * 
 * Usage:
 *   import { optimizedChatFlow } from './optimizedLangGraph';
 *   
 *   const result = await optimizedChatFlow({
 *     message: userMessage,
 *     history: chatHistory,
 *     retrieveContext: async (query) => { ... }, // RAG retrieval function
 *     geminiApiKey: GEMINI_API_KEY,
 *     userId: userId,
 *     db: db,
 *     appId: appId
 *   });
 */

/**
 * Combined reasoning function that handles all steps in a single LLM call:
 * - Intent detection
 * - Health triage
 * - Memory/context understanding
 * - RAG reasoning
 * - Safety validation
 * - Response generation
 */
async function combinedReasoning({
  message,
  history,
  context,
  geminiApiKey,
  model = "gemini-2.5-flash"
}) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

  // Build conversation history (last 10 messages for context)
  // Handle different history formats
  const conversationHistory = (history || [])
    .slice(-10)
    .filter(msg => msg && (msg.role || msg.text)) // Filter out invalid messages
    .map(msg => {
      const role = msg.role === 'model' ? 'model' : 'user';
      const text = msg.text || msg.content || '';
      return {
        role: role,
        parts: [{ text: text }]
      };
    });

  // Combined system instruction that handles all reasoning steps
  const systemInstruction = {
    parts: [{
      text: `You are a helpful and professional Health Navigator chatbot of VytalCare.

Your task is to analyze the user's message and provide a comprehensive, safe medical response.

IMPORTANT RULES:
- Use the provided medical context to answer questions accurately
- Do NOT diagnose specific conditions
- Do NOT prescribe medications
- Always recommend professional consultation for medical concerns
- Be empathetic and clear in your communication
- Maintain conversation continuity based on history
- Provide clear, helpful responses in natural language

RESPONSE FORMAT:
Respond ONLY with a JSON object (no markdown, no code blocks, just pure JSON):
{
  "intent": "medical_question|symptom_check|medication_info|general_advice|other",
  "urgency": "low|medium|high",
  "needs_professional": true|false,
  "answer": "Your main helpful response text here - write this naturally as if talking to the user",
  "key_points": ["point 1", "point 2", "point 3"],
  "safety_notes": "Any safety disclaimers or recommendations",
  "sources_used": []
}

The "answer" field should be your main response to the user. Keep it concise and friendly.
Provide 2-4 short key points in "key_points".

MEDICAL CONTEXT:
${context || "No specific medical context available. Use general knowledge and recommend professional consultation."}

Now analyze the user's message and respond with ONLY the JSON object (no other text).`
    }]
  };

  const payload = {
    contents: [
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ],
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON response
    const responseText = candidate.content.parts[0].text;
    let parsedResponse;
    
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, responseText];
      const jsonText = jsonMatch[1] || responseText;
      parsedResponse = JSON.parse(jsonText);
      
      // Validate the response has required fields
      if (!parsedResponse.response) {
        parsedResponse.response = responseText;
      }
    } catch (parseError) {
      // Fallback: if JSON parsing fails, use the text as response
      console.warn('Failed to parse JSON response, using text directly:', parseError);
      parsedResponse = {
        intent: "other",
        urgency: "low",
        needs_professional: true,
        response: responseText,
        safety_notes: "Please consult a healthcare professional for medical advice.",
        sources_used: []
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error('Combined reasoning error:', error);
    throw error;
  }
}

/**
 * Optional: Tool summary call (only if needed for complex tool usage)
 * This is the second optional call mentioned in the optimization
 */
async function toolSummaryCall({
  toolResults,
  originalMessage,
  geminiApiKey,
  model = "gemini-2.5-flash"
}) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [{
        text: `Summarize the following tool results into a clear, user-friendly response:

Original Question: ${originalMessage}

Tool Results:
${JSON.stringify(toolResults, null, 2)}

Provide a concise summary that answers the user's question based on these results.`
      }]
    }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 1024
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Tool summary API error: ${response.status}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    return candidate?.content?.parts?.[0]?.text || 'Unable to summarize tool results.';
  } catch (error) {
    console.error('Tool summary error:', error);
    return 'Tool results processed, but summary generation failed.';
  }
}

/**
 * Main optimized chat flow function
 * 
 * @param {Object} params
 * @param {string} params.message - User's message
 * @param {Array} params.history - Chat history array
 * @param {Function} params.retrieveContext - Async function to retrieve RAG context (query) => Promise<string|Array>
 * @param {string} params.geminiApiKey - Gemini API key
 * @param {string} params.userId - User ID for logging
 * @param {Object} params.db - Firestore database instance (optional)
 * @param {string} params.appId - App ID for Firestore paths (optional)
 * @param {string} params.model - Gemini model to use (default: "gemini-2.5-flash")
 * @param {boolean} params.enableToolSummary - Whether to use optional tool summary call (default: false)
 * 
 * @returns {Promise<Object>} - { response, intent, urgency, needsProfessional, safetyNotes, sources }
 */
export async function optimizedChatFlow({
  message,
  history = [],
  retrieveContext,
  geminiApiKey,
  userId = null,
  db = null,
  appId = null,
  model = "gemini-2.5-flash",
  enableToolSummary = false
}) {
  try {
    // Step 1: Retrieve RAG context (non-LLM operation, just vector search)
    let context = '';
    let sources = [];
    
    if (retrieveContext && typeof retrieveContext === 'function') {
      try {
        const contextResult = await retrieveContext(message);
        
        // Handle different return types from retrieveContext
        if (Array.isArray(contextResult)) {
          // If it returns an array of results (like Qdrant search results)
          context = contextResult
            .map((r, i) => {
              const payload = r.payload || r;
              return `[SOURCE ${i + 1}]
TITLE: ${payload.title || 'Unknown'}
URL: ${payload.url || ''}

SUMMARY:
${payload.summary || payload.text || ''}`;
            })
            .join('\n\n');
          
          sources = contextResult.map(r => {
            const payload = r.payload || r;
            return {
              title: payload.title || 'Unknown',
              url: payload.url || ''
            };
          });
        } else if (typeof contextResult === 'string') {
          // If it returns a formatted string directly (like current retrieve_context.js)
          context = contextResult;
          
          // Try to extract sources from the formatted string
          const sourceMatches = contextResult.matchAll(/TITLE:\s*(.+?)\nURL:\s*(.+?)\n/g);
          for (const match of sourceMatches) {
            sources.push({
              title: match[1] || 'Unknown',
              url: match[2] || ''
            });
          }
        } else {
          // Fallback: stringify if it's an object
          context = JSON.stringify(contextResult);
        }
      } catch (contextError) {
        console.warn('RAG context retrieval failed:', contextError);
        context = 'No medical context available.';
      }
    }

    // Step 2: Single combined reasoning call (replaces 5-6 separate calls)
    const reasoningResult = await combinedReasoning({
      message,
      history,
      context,
      geminiApiKey,
      model
    });

    // Step 3: Optional tool summary call (only if enabled and tools were used)
    let finalResponse = reasoningResult.response;
    if (enableToolSummary && reasoningResult.tool_results) {
      const summary = await toolSummaryCall({
        toolResults: reasoningResult.tool_results,
        originalMessage: message,
        geminiApiKey,
        model
      });
      finalResponse = summary;
    }

    // Step 4: Build final result
    // Format sources as URL strings (like the old format) for UI compatibility
    let formattedSources = sources.map(src => {
      if (typeof src === 'object' && (src.url || src.uri)) {
        return src.url || src.uri; // Extract URL from object
      }
      if (typeof src === 'string') {
        return src; // Already a string
      }
      return '';
    }).filter(url => url); // Remove empty strings

    // Fallback: use sources_used from the model if RAG sources are empty
    if ((!formattedSources || formattedSources.length === 0) && Array.isArray(reasoningResult.sources_used)) {
      formattedSources = reasoningResult.sources_used.map(src => {
        if (typeof src === 'object' && (src.url || src.uri)) {
          return src.url || src.uri;
        }
        if (typeof src === 'string') {
          return src;
        }
        return '';
      }).filter(url => url);
    }

    // Final fallback: extract URLs from context text if still empty
    if ((!formattedSources || formattedSources.length === 0) && typeof context === 'string') {
      const urlMatches = Array.from(context.matchAll(/https?:\/\/[^\s)]+/g)).map(m => m[0]);
      if (urlMatches.length > 0) {
        formattedSources = urlMatches;
      }
    }

    // Build a display-friendly response similar to the old format
    const answerText = reasoningResult.answer || reasoningResult.response || finalResponse;
    const keyPoints = Array.isArray(reasoningResult.key_points) ? reasoningResult.key_points : [];
    const safetyNote = reasoningResult.safety_notes || 'Please consult a healthcare professional for medical advice.';

    let displayText = `ANSWER:\n${answerText}`;
    if (keyPoints.length > 0) {
      displayText += `\n\nKEY POINTS:\n${keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}`;
    }
    if (safetyNote) {
      displayText += `\n\n${safetyNote}`;
    }

    const result = {
      response: displayText,
      intent: reasoningResult.intent || 'other',
      urgency: reasoningResult.urgency || 'low',
      needsProfessional: reasoningResult.needs_professional || false,
      safetyNotes: safetyNote,
      sources: formattedSources, // Format as URL strings for UI
      // Additional metadata
      metadata: {
        modelUsed: model,
        contextRetrieved: context.length > 0,
        toolSummaryUsed: enableToolSummary && reasoningResult.tool_results ? true : false
      }
    };

    return result;
  } catch (error) {
    console.error('Optimized chat flow error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      geminiApiKey: geminiApiKey ? 'Present' : 'Missing'
    });
    
    // Fallback response on error - provide more helpful message
    const errorMessage = error.message || 'Unknown error';
    return {
      response: `I apologize, but I encountered an error: ${errorMessage}. Please try again or consult a healthcare professional for urgent medical concerns.`,
      intent: 'error',
      urgency: 'low',
      needsProfessional: true,
      safetyNotes: 'If you have urgent medical concerns, please contact a healthcare professional immediately.',
      sources: [],
      metadata: {
        error: error.message,
        errorType: error.name
      }
    };
  }
}

/**
 * Streaming version of the optimized chat flow
 * Returns a ReadableStream for real-time response streaming
 * 
 * @param {Object} params - Same as optimizedChatFlow
 * @returns {Promise<ReadableStream>} - Streaming response
 */
export async function optimizedChatFlowStream({
  message,
  history = [],
  retrieveContext,
  geminiApiKey,
  userId = null,
  db = null,
  appId = null,
  model = "gemini-2.5-flash"
}) {
  const encoder = new TextEncoder();

  try {
    // Step 1: Retrieve RAG context
    let context = '';
    let sources = [];
    
    if (retrieveContext && typeof retrieveContext === 'function') {
      try {
        const contextResult = await retrieveContext(message);
        
        if (Array.isArray(contextResult)) {
          context = contextResult
            .map((r, i) => {
              const payload = r.payload || r;
              return `[SOURCE ${i + 1}]\nTITLE: ${payload.title || 'Unknown'}\nURL: ${payload.url || ''}\n\nSUMMARY:\n${payload.summary || payload.text || ''}`;
            })
            .join('\n\n');
          
          sources = contextResult.map(r => {
            const payload = r.payload || r;
            return {
              title: payload.title || 'Unknown',
              url: payload.url || ''
            };
          });
        } else if (typeof contextResult === 'string') {
          context = contextResult;
          
          // Try to extract sources from the formatted string
          const sourceMatches = contextResult.matchAll(/TITLE:\s*(.+?)\nURL:\s*(.+?)\n/g);
          for (const match of sourceMatches) {
            sources.push({
              title: match[1] || 'Unknown',
              url: match[2] || ''
            });
          }
        }
      } catch (contextError) {
        console.warn('RAG context retrieval failed:', contextError);
      }
    }

    // Step 2: Stream the combined reasoning response
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    const conversationHistory = history
      .slice(-10)
      .map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || '' }]
      }));

    const systemInstruction = {
      parts: [{
        text: `You are a helpful and professional Health Navigator chatbot of VytalCare.

Analyze the user's message and provide a comprehensive, safe medical response.

RULES:
- Use the provided medical context to answer accurately
- Do NOT diagnose specific conditions
- Do NOT prescribe medications
- Always recommend professional consultation for medical concerns
- Be empathetic and clear

MEDICAL CONTEXT:
${context || "No specific medical context available. Use general knowledge and recommend professional consultation."}

Provide a helpful, safe response to the user's question.`
      }]
    };

    const payload = {
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95
      }
    };

    // For streaming, we'll use the streaming endpoint
    const streamUrl = `${apiUrl}&alt=sse`;
    
    return new ReadableStream({
      async start(controller) {
        // Send sources first
        if (sources.length > 0) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "sources", sources }) + "\n"
            )
          );
        }

        try {
          // Use fetch with streaming
          const response = await fetch(streamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`Streaming API error: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (text) {
                    controller.enqueue(
                      encoder.encode(
                        JSON.stringify({ type: "token", token: text }) + "\n"
                      )
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "error", message: error.message }) + "\n"
            )
          );
          controller.close();
        }
      }
    });
  } catch (error) {
    console.error('Streaming flow error:', error);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "error", message: "Streaming failed" }) + "\n"
          )
        );
        controller.close();
      }
    });
  }
}

/**
 * Helper function to create a retrieveContext function compatible with your RAG system
 * This can be used if you want to integrate with the existing RAG endpoint
 * 
 * @param {string} ragEndpoint - URL to your RAG endpoint (e.g., "/api/chat-rag")
 * @returns {Function} - retrieveContext function
 */
export function createRagRetrieveContext(ragEndpoint) {
  return async (query) => {
    try {
      // If you have a separate endpoint for just retrieval (without LLM)
      const response = await fetch(`${ragEndpoint}/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        return data.results || data.context || [];
      }
    } catch (error) {
      console.warn('RAG retrieval failed:', error);
    }
    return [];
  };
}

/**
 * Wrapper function for retrieveContext that returns raw Qdrant results
 * Use this if your retrieveContext returns a formatted string but you need array format
 * 
 * @param {Function} retrieveContextFn - Original retrieveContext function
 * @param {Object} qdrantClient - Qdrant client instance (optional, if you have direct access)
 * @param {Object} embedModel - Embedding model instance (optional)
 * @returns {Function} - Wrapped retrieveContext that returns array
 */
export function wrapRetrieveContextForArray(retrieveContextFn, qdrantClient = null, embedModel = null) {
  return async (query) => {
    // If you have direct access to Qdrant, use it directly
    if (qdrantClient && embedModel) {
      try {
        const embeddingResponse = await embedModel.embedContent(query);
        const queryVector = embeddingResponse.embedding.values;
        const searchResult = await qdrantClient.search("medical_knowledge", {
          vector: queryVector,
          limit: 3,
        });
        return searchResult; // Returns array of results with payload
      } catch (error) {
        console.warn('Direct Qdrant retrieval failed:', error);
      }
    }
    
    // Fallback: use the original function and parse the string
    try {
      const contextString = await retrieveContextFn(query);
      if (typeof contextString === 'string') {
        // Parse the formatted string back to array format
        // This is a best-effort parsing
        const results = [];
        const sections = contextString.split(/\[RESULT \d+\]/);
        
        for (let i = 1; i < sections.length; i++) {
          const section = sections[i];
          const titleMatch = section.match(/TITLE:\s*(.+?)\n/);
          const urlMatch = section.match(/URL:\s*(.+?)\n/);
          const summaryMatch = section.match(/SUMMARY:\s*([\s\S]*?)(?=\n\[|$)/);
          
          if (titleMatch || summaryMatch) {
            results.push({
              payload: {
                title: titleMatch ? titleMatch[1].trim() : 'Unknown',
                url: urlMatch ? urlMatch[1].trim() : '',
                summary: summaryMatch ? summaryMatch[1].trim() : ''
              }
            });
          }
        }
        
        return results.length > 0 ? results : [{ payload: { title: 'Context', summary: contextString } }];
      }
      return contextString;
    } catch (error) {
      console.warn('Wrapped retrieval failed:', error);
      return [];
    }
  };
}

/**
 * Example usage and integration guide:
 * 
 * // In your App.jsx or chat component:
 * 
 * import { optimizedChatFlow, optimizedChatFlowStream } from './optimizedLangGraph';
 * import { retrieveContext } from '../vytalcare-rag/ingest/retrieve_context';
 * 
 * // For non-streaming:
 * const result = await optimizedChatFlow({
 *   message: userMessage,
 *   history: chatHistory,
 *   retrieveContext: async (query) => {
 *     // Use your existing RAG retrieval
 *     const results = await retrieveContext(query);
 *     return results; // Should return array or string
 *   },
 *   geminiApiKey: GEMINI_API_KEY,
 *   userId: userId,
 *   db: db,
 *   appId: appId
 * });
 * 
 * // For streaming:
 * const stream = await optimizedChatFlowStream({
 *   message: userMessage,
 *   history: chatHistory,
 *   retrieveContext: async (query) => {
 *     const results = await retrieveContext(query);
 *     return results;
 *   },
 *   geminiApiKey: GEMINI_API_KEY
 * });
 * 
 * // Process stream
 * const reader = stream.getReader();
 * const decoder = new TextDecoder();
 * 
 * while (true) {
 *   const { done, value } = await reader.read();
 *   if (done) break;
 *   
 *   const chunk = decoder.decode(value);
 *   const lines = chunk.split('\n');
 *   for (const line of lines) {
 *     if (line.trim()) {
 *       const data = JSON.parse(line);
 *       if (data.type === 'sources') {
 *         // Handle sources
 *       } else if (data.type === 'token') {
 *         // Handle streaming tokens
 *       }
 *     }
 *   }
 * }
 */


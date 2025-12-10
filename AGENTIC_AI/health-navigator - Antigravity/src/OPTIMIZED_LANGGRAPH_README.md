# Optimized LangGraph Implementation

## Overview

This optimized LangGraph-style flow reduces LLM API calls from **5-6 per message to 1-2 calls**, resulting in a **60-70% cost reduction** while maintaining the same intelligence and response quality.

## What It Does

### Before (Current Flow):
1. ❌ Intent detection call
2. ❌ Health triage call
3. ❌ Memory fetch call
4. ❌ RAG reasoning call
5. ❌ Safety validation call
6. ❌ Final response call

**Total: 5-6 LLM calls per message**

### After (Optimized Flow):
1. ✅ **Single combined reasoning call** (handles all steps internally)
2. ✅ **Optional tool summary call** (only if tools are used)

**Total: 1-2 LLM calls per message**

## Files

- `optimizedLangGraph.js` - Main implementation file

## Usage

### Basic Integration

```javascript
import { optimizedChatFlow } from './optimizedLangGraph';
import { retrieveContext } from '../vytalcare-rag/ingest/retrieve_context';

// In your chat handler
const result = await optimizedChatFlow({
  message: userMessage,
  history: chatHistory,
  retrieveContext: async (query) => {
    // Use your existing RAG retrieval
    const results = await retrieveContext(query);
    return results;
  },
  geminiApiKey: GEMINI_API_KEY,
  userId: userId,
  db: db,
  appId: appId
});

// Use the result
console.log(result.response);        // Main response text
console.log(result.intent);          // Detected intent
console.log(result.urgency);          // Urgency level
console.log(result.needsProfessional); // Whether professional help is needed
console.log(result.safetyNotes);      // Safety disclaimers
console.log(result.sources);          // RAG sources used
```

### Streaming Integration

```javascript
import { optimizedChatFlowStream } from './optimizedLangGraph';

const stream = await optimizedChatFlowStream({
  message: userMessage,
  history: chatHistory,
  retrieveContext: async (query) => {
    const results = await retrieveContext(query);
    return results;
  },
  geminiApiKey: GEMINI_API_KEY
});

// Process the stream
const reader = stream.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'sources') {
          // Handle sources
          console.log('Sources:', data.sources);
        } else if (data.type === 'token') {
          // Handle streaming tokens
          process.stdout.write(data.token);
        } else if (data.type === 'error') {
          console.error('Error:', data.message);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}
```

## API Reference

### `optimizedChatFlow(params)`

Main function for non-streaming optimized chat flow.

**Parameters:**
- `message` (string, required): User's message
- `history` (Array, optional): Chat history array
- `retrieveContext` (Function, optional): Async function to retrieve RAG context
- `geminiApiKey` (string, required): Gemini API key
- `userId` (string, optional): User ID for logging
- `db` (Object, optional): Firestore database instance
- `appId` (string, optional): App ID for Firestore paths
- `model` (string, optional): Gemini model to use (default: "gemini-2.5-flash")
- `enableToolSummary` (boolean, optional): Enable optional tool summary call (default: false)

**Returns:**
```javascript
{
  response: string,              // Main response text
  intent: string,                // Detected intent
  urgency: string,               // "low" | "medium" | "high"
  needsProfessional: boolean,    // Whether professional help is needed
  safetyNotes: string,           // Safety disclaimers
  sources: Array,                // RAG sources used
  metadata: {
    modelUsed: string,
    contextRetrieved: boolean,
    toolSummaryUsed: boolean
  }
}
```

### `optimizedChatFlowStream(params)`

Streaming version of the optimized chat flow.

**Parameters:** Same as `optimizedChatFlow`

**Returns:** `ReadableStream` that emits:
- `{ type: "sources", sources: Array }` - RAG sources
- `{ type: "token", token: string }` - Streaming response tokens
- `{ type: "error", message: string }` - Error messages

### `createRagRetrieveContext(ragEndpoint)`

Helper function to create a retrieveContext function compatible with your RAG system.

**Parameters:**
- `ragEndpoint` (string): URL to your RAG endpoint

**Returns:** Function that can be used as `retrieveContext` parameter

## How It Works

### Combined Reasoning

The single LLM call performs all these steps internally:

1. **Intent Detection**: Determines what the user is asking
2. **Health Triage**: Assesses urgency level
3. **Context Understanding**: Uses conversation history
4. **RAG Reasoning**: Uses retrieved medical context
5. **Safety Validation**: Ensures safe, non-diagnostic responses
6. **Response Generation**: Creates the final response

All of this happens in **one API call** with a structured JSON response.

### RAG Integration

The function accepts a `retrieveContext` function that should:
- Take a query string as input
- Return either:
  - An array of results (with `payload.title`, `payload.url`, `payload.summary`)
  - A string containing the context
  - Any object that can be stringified

The function handles different return types automatically.

## Cost Savings

### Example Calculation:

**Before:**
- 6 calls per message × 1000 tokens each = 6000 tokens
- Cost: ~$0.006 per message (at $0.001 per 1K tokens)

**After:**
- 1 call per message × 2000 tokens = 2000 tokens
- Cost: ~$0.002 per message

**Savings: 66% reduction in API costs**

## Integration Steps

1. **Import the function** in your chat component:
   ```javascript
   import { optimizedChatFlow } from './optimizedLangGraph';
   ```

2. **Replace your current chat API call** with the optimized version:
   ```javascript
   // Old way (multiple calls)
   // ... your existing code ...
   
   // New way (single call)
   const result = await optimizedChatFlow({
     message: newMessage,
     history: chatHistory,
     retrieveContext: async (query) => {
       // Your RAG retrieval logic
       return await retrieveContext(query);
     },
     geminiApiKey: GEMINI_API_KEY,
     userId: userId,
     db: db,
     appId: appId
   });
   ```

3. **Update your response handling**:
   ```javascript
   const modelMessage = {
     role: "model",
     text: result.response,
     sources: result.sources,
     createdAt: Date.now()
   };
   
   // Save to Firestore, update UI, etc.
   ```

## Benefits

✅ **60-70% cost reduction** in API calls
✅ **Faster responses** (fewer network round trips)
✅ **Same intelligence** (all reasoning steps still performed)
✅ **Better error handling** (single point of failure)
✅ **Easier to maintain** (simpler code flow)
✅ **Backward compatible** (can be integrated gradually)

## Notes

- The function is designed to work with your existing RAG system
- No changes needed to your existing files
- Can be integrated incrementally
- Falls back gracefully on errors
- Supports both streaming and non-streaming modes

## Example: Full Integration

```javascript
// In your App.jsx callChatbotAPI function

import { optimizedChatFlow } from './optimizedLangGraph';
import { retrieveContext } from '../vytalcare-rag/ingest/retrieve_context';

const callChatbotAPI = useCallback(async (newMessage, imageInlineData = null) => {
  setIsChatLoading(true);
  
  // Handle image messages separately (if needed)
  if (imageInlineData) {
    // ... your existing image handling ...
    return;
  }
  
  // Use optimized flow for text messages
  try {
    const result = await optimizedChatFlow({
      message: newMessage,
      history: chatHistory,
      retrieveContext: async (query) => {
        // Use your existing RAG retrieval
        const results = await retrieveContext(query);
        return results;
      },
      geminiApiKey: GEMINI_API_KEY,
      userId: userId,
      db: db,
      appId: appId
    });
    
    // Create model message
    const modelMessage = {
      role: "model",
      text: result.response,
      sources: result.sources,
      createdAt: Date.now()
    };
    
    // Save to Firestore
    if (db && userId) {
      const chatCollectionRef = collection(
        db,
        `/artifacts/${appId}/users/${userId}/chats`
      );
      await addDoc(chatCollectionRef, modelMessage);
    }
    
    // Update UI
    setChatHistory(prev => [...prev, modelMessage]);
    
  } catch (error) {
    console.error('Chat error:', error);
    setError('Failed to get response. Please try again.');
  } finally {
    setIsChatLoading(false);
  }
}, [chatHistory, db, userId, appId]);
```

## Support

For questions or issues, refer to the inline documentation in `optimizedLangGraph.js`.


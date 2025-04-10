# my-mcp-agent
Implementation of the MCP Protocol for Agentic AI

How to test: 

1 -  Start the server 
npm start 

2 - Run the client
node client.js

3 - GET call to get the sessionID
curl --location 'http://localhost:3001/sse' \
--header 'Content-Type: text/event-stream' \
--header 'Cache: no-cache' \
--header 'Connection: keep-alive'

the above returnsn the session ID

4 - POST Call
curl --location 'http://localhost:3001/messages?sessionId=<sessionID>' \
--header 'Cache: no-cache' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "answerQuestion1",
      "arguments": {
        "question": ""
      }
    },
    "id": 1
  }'

which returns 202 Accepted (Async call) 

However on the CLI of the client you will see the "Hello world" MessageEvent for the question / answering: 
MessageEvent {
  type: 'message',
  data: {"result":{"content":[{"type":"text","text":"I don't have enough information to answer that question about the document."}]},"jsonrpc":"2.0","id":"1"},
  lastEventId: '',
  origin: 'http://localhost:3001'
}



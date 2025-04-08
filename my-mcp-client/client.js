//import EventSource from 'launchdarkly-eventsource';


import eventsource from 'launchdarkly-eventsource';
const { EventSource} = eventsource;
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import pkg from 'json-rpc-client';
const { JSONRPCClient } = pkg;

async function main() {
  const sseUrl = 'http://localhost:3001/sse'; // Replace if your server is running elsewhere
  const eventSource = new EventSource(sseUrl);

  let sessionId = null;

  //const jsonRpc = new JSONRPCClient((request) => {
  const jsonRpc = new pkg((request) => {
    eventSource.send(JSON.stringify(request));
  });

  eventSource.onmessage = (event) => {
    console.log('Received SSE event:', event);
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'sessionId') {
          sessionId = data.sessionId;
          console.log('Session ID:', sessionId);
          return;
      }

      jsonRpc.receive(data);
    } catch (e) {
      console.error('SSE message parsing error:', e, event);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
  };

  // Wait for the session ID to be established
  await new Promise((resolve) => {
    eventSource.addEventListener('open', () => {
      console.log('SSE connection opened');
      resolve();
    });
  });

  const client = new Client({
    name: 'BrowserClient',
    version: '1.0.0',
  });


  await client.connect();
  await client.initialize();

  document.getElementById('loadDocument').addEventListener('click', async () => {
    const result = await client.executeTool('loadDocument', { document: 'Your document content here' });
    document.getElementById('output').textContent = JSON.stringify(result);
  });

  document.getElementById('answerQuestion').addEventListener('click', async () => {
    const result = await client.executeTool('answerQuestion', { question: 'What is the main topic?' });
    document.getElementById('output').textContent = JSON.stringify(result);
  });
}

main().catch(console.error);

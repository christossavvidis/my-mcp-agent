import { Client } from '@modelcontextprotocol/sdk/dist/esm/client/index.js';

async function main() {
  const client = new Client();
  await client.connect('myAgent', {
    transport: {
      type: 'stdio', // Assuming server runs locally
      command: 'node',  // Path to node
      args: ['../my-mcp-agent/build/index.js'] // Path to the built server file
    },
  });

  // Load Document
  const loadResult = await client.executeTool('myAgent', 'loadDocument', {
    document: 'Your technical document content here...'
  });
  console.log('Load Document Result:', loadResult);

  // Ask a question
  const answerResult = await client.executeTool('myAgent', 'answerQuestion', {
    question: 'What is the main purpose of this document?'
  });
  console.log('Answer:', answerResult.content[0].text);
}

main().catch(console.error);

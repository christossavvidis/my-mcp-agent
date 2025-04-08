import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from 'zod';

const server = new McpServer({
  name: "TechnicalDocumentAgent",
  version: "1.0.0",
});


  // Dummy Question Answering Function
  async function answerQuestion(question: string): Promise<string> {
    // Replace this with actual question answering logic
    // For example, use a vector database and embeddings
    return `I don't have enough information to answer that question about the document.`;
  }



// ... set up server resources, tools, and prompts ...
let documentContent: string = "";

  

    // Resource: Document Content
    server.resource('document', 'mcp://document/content', () => {
      return {
        contents: [{ uri: 'mcp://document/content', text: documentContent }],
      };
    });

    // Tool: Answer Question
    server.tool(
      'answerQuestion',
      'Answer a question about the document',
      { question: z.string() },
      async ({ question }: {question:string}) => {
        // Implement Question Answering Logic Here
        const answer = await answerQuestion(question);
        return { content: [{ type: 'text', text: answer }] };
      }
    );

    // Tool: Load Document
    server.tool(
        'loadDocument',
        'Load a technical document into the agent',
        { document: z.string() },
        async ({ document }: {document:string}) => {
            documentContent = document;
            return { content: [{ type: 'text', text: 'Document loaded successfully.' }] };
        }
    );



const app = express();

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports: {[sessionId: string]: SSEServerTransport} = {};

app.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

app.listen(3001);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const zod_1 = require("zod");
const server = new mcp_js_1.McpServer({
    name: "TechnicalDocumentAgent",
    version: "1.0.0",
});
// Dummy Question Answering Function
async function answerQuestion(question) {
    // Replace this with actual question answering logic
    // For example, use a vector database and embeddings
    return `I don't have enough information to answer that question about the document.`;
}
// ... set up server resources, tools, and prompts ...
let documentContent = "";
// Resource: Document Content
server.resource('document', 'mcp://document/content', () => {
    return {
        contents: [{ uri: 'mcp://document/content', text: documentContent }],
    };
});
// Tool: Answer Question
server.tool('answerQuestion', 'Answer a question about the document', { question: zod_1.z.string() }, async ({ question }) => {
    // Implement Question Answering Logic Here
    const answer = await answerQuestion(question);
    return { content: [{ type: 'text', text: answer }] };
});
// Tool: Load Document
server.tool('loadDocument', 'Load a technical document into the agent', { document: zod_1.z.string() }, async ({ document }) => {
    documentContent = document;
    return { content: [{ type: 'text', text: 'Document loaded successfully.' }] };
});
const app = (0, express_1.default)();
// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};


app.get("/sse", async (_, res) => {
    const transport = new sse_js_1.SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    await server.connect(transport);
});
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    }
    else {
        res.status(400).send('No transport found for sessionId');
    }
});


app.listen(3001);

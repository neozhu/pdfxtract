import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"
export async function POST(req: Request) {
  const { messages } = await req.json();
  const { content } = messages[messages.length - 1]; // 获取最后一条消息

  // Extract the image path from content
  const imagePath = content.startsWith('/api/pdf-outputs/')
    ? content.replace('/api/pdf-outputs/', '')
    : content;  console.log("Image path:", imagePath);
  // Read the image file from public directory
  const imageData = fs.readFileSync(path.join(process.cwd(), 'public', 'pdf-outputs', imagePath));
  console.log("Image data length:", imageData.length);
  const result = await generateText({
    model: google(GEMINI_MODEL),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Transcribe all visible text from the uploaded image into Markdown, precisely replicating the original visual layout and formatting. This includes:

* Exact line breaks
* Indentation and alignment
* Relative positions of text blocks
* Column and table structures
* Original spacing between words, lines, and paragraphs
* Accurate application of all formatting (bold, italics, headings, lists, tables, code, etc.)

Do not use a Markdown code block to wrap the entire output. Output only the direct Markdown content—no explanations, commentary, or reasoning.
`.trim(),
          },
          {
            type: 'image',
            image: imageData,
            mimeType: 'image/jpeg', 
          },
        ],
      },
    ],
  });   
  
  console.log("AI response:\n\n", result.text);

  
  const cleanText = result.text;   
  
  // Return a proper JSON response with the AI-generated text
  return new Response(JSON.stringify({ content: cleanText }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
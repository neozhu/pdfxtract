import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
// Get model from environment variable or use default
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro"
export async function POST(req: Request) {
  const {prompt} = await req.json();
  console.log("Request body:", prompt);

  const content = prompt; // Assuming content is directly in the request body
  // Extract the image path from content
  const imagePath = content.startsWith('/api/pdf-outputs/')
    ? content.replace('/api/pdf-outputs/', '')
    : content;  console.log("Image path:", imagePath);
  // Read the image file from public directory
  const imageData = fs.readFileSync(path.join(process.cwd(), 'public', 'pdf-outputs', imagePath));
  console.log("Image data length:", imageData.length);
  const result = await streamText({
    model: google(GEMINI_MODEL),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Transcribe all visible text from the uploaded image into Markdown, precisely replicating the original visual layout and formatting. This includes:
* Correcting any rotation or skew so that text is properly oriented before transcription
* Do not convert or recognize the content as HTML code. Always use Markdown to represent all text and structure.
* Exact line breaks
* Indentation and alignment
* Relative positions of text blocks
* Column and table structures
* Original spacing between words, lines, and paragraphs
* Accurate application of all formatting (bold, italics, headings, lists, tables, code, etc.)

Do NOT wrap the output in any code blocks (such as ormarkdown). Output plain Markdown only, with no additional formatting or wrappers.
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
  return result.toDataStreamResponse({sendReasoning:false});
  //console.log("AI response:\n\n", result.text);

  
  //const cleanText = result.text;   
  
  // Return a proper JSON response with the AI-generated text
  // return new Response(JSON.stringify({ content: cleanText }), {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });
}
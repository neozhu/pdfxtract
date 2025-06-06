import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
// Get model from environment variable or use default
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"
export async function POST(req: Request) {
  const {prompt} = await req.json();
  console.log('GEMINI_MODEL:',GEMINI_MODEL);

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
* Correcting any rotation or skew so that text is properly oriented before transcription.
* If the image contains calligraphy or ancient books (including manuscripts, rubbings, etc.), do NOT rotate or adjust the orientation; transcribe the text exactly as it appears, preserving the original layout and direction.
* If there are any seals or stamps (including author’s seals, leisure seals, studio seals, collector’s seals, etc.), transcribe and clearly indicate them, describing the type (e.g., name seal, leisure seal, collector’s seal) if possible.
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
}
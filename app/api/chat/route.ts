import { google } from '@ai-sdk/google';
import { openai} from '@ai-sdk/openai';
import { streamText } from 'ai';
import fs from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {prompt,model,provider} = await req.json();
  console.log('MODEL:',model);
  console.log('PROVIDER:',provider);
  const content = prompt; // Assuming content is directly in the request body
  // Extract the image path from content
  const imagePath = content.startsWith('/api/pdf-outputs/')
    ? content.replace('/api/pdf-outputs/', '')
    : content;  
  console.log("Image path:", imagePath);
  // Read the image file from public directory
  const imageData = fs.readFileSync(path.join(process.cwd(), 'public', 'pdf-outputs', imagePath));
  console.log("Image data length:", imageData.length);  // Select model provider based on the provider parameter
  let modelProvider;
  if (provider === 'openai') {
    modelProvider = openai(model);
  } else {
    // Default to Google if provider is not specified or is 'google'
    modelProvider = google(model);
  }

  const result = await streamText({
    model: modelProvider,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Technical document OCR: Extract text content from document image maintaining original structure and formatting, This includes:
* Correcting any rotation or skew so that text is properly oriented before transcription.
* If the image contains handwritten or brush script text (including all kinds of handwritten Chinese or cursive/brush text), please transcribe the text following modern reading order (horizontal rows, left-to-right). Preserve the original paragraph structure and relative layout for clarity and usability.
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
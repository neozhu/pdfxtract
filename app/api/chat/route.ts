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
            text: 'Transcribe all visible text from the uploaded image. Reproduce the content faithfully using Markdown syntax, meticulously preserving the original visual layout, spacing, and alignment of all elements. This includes maintaining: \n- Exact line breaks\n- Indentation levels\n- Relative positioning of text blocks\n- Columnar structures (if any)\n- Any specific spacing between words, lines, or paragraphs\n\nApply all original formatting (e.g., bold, italics, headings, lists, tables) precisely as shown. Provide only the Markdown output, without any additional explanations, commentary, or reasoning.',
          },
          {
            type: 'image',
            image: imageData,
            mimeType: 'image/jpeg', 
          },
        ],
      },
    ],
  });   console.log("AI response:", result.text);

  
  const cleanText = result.text
    .replace(/^```[a-zA-Z]*\n/, '') 
    .replace(/\n```$/, '');         
  
  // Return a proper JSON response with the AI-generated text
  return new Response(JSON.stringify({ content: cleanText }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
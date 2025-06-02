import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"
export async function POST(req: Request) {
  const { messages } = await req.json();
  const { content } = messages[messages.length - 1]; // 获取最后一条消息

  // Extract the image path from content
  const imagePath = content.startsWith('/api/pdf-outputs/')
    ? content.replace('/api/pdf-outputs/', '')
    : content;
  console.log("Image path:", imagePath);
  // Read the image file from public directory
  const fs = require('fs');
  const path = require('path');
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
            text: 'Recognize all text from the uploaded image and precisely reproduce it in markdown format. Maintain the original layout, formatting, and styling exactly as shown in the image. Do not include any additional explanations, reasoning, or commentary—only output the markdown content.',
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
  console.log("AI response:", result.text);

  // Return a proper JSON response with the AI-generated text
  return new Response(JSON.stringify({ content: result.text }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
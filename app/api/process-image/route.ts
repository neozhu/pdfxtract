import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Create output directory
    const outputBaseDir = path.join(process.cwd(), 'public', 'pdf-outputs');
    const baseName = path.basename(file.name, path.extname(file.name));
    const outputDir = path.join(outputBaseDir, baseName);
    fs.mkdirSync(outputDir, { recursive: true });

    // Get file extension
    const fileExtension = path.extname(file.name).toLowerCase() || '.jpg';
    const fileName = `image${fileExtension}`;
    const filePath = path.join(outputDir, fileName);

    // Save the image file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Return the API path for the image
    const imagePath = `/api/pdf-outputs/${baseName}/${fileName}`;

    return NextResponse.json({ imagePath });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Error processing image' },
      { status: 500 }
    );
  }
} 
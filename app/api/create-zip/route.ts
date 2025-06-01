import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

export const runtime = 'nodejs';

/**
 * This API creates a zip file of JPG images from a given directory name
 * The directory should be in public/pdf-outputs/
 */
export async function POST(request: Request) {
  try {
    // Get the directory name from the request
    const { dirName } = await request.json();
    
    if (!dirName) {
      return NextResponse.json(
        { error: 'No directory name provided' },
        { status: 400 }
      );
    }

    // Validate the directory name to prevent directory traversal attacks
    if (dirName.includes('..') || dirName.includes('/') || dirName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid directory name' },
        { status: 400 }
      );
    }

    // Create the full path to the directory
    const outputBaseDir = path.join(process.cwd(), 'public', 'pdf-outputs');
    const dirPath = path.join(outputBaseDir, dirName);
    
    // Check if the directory exists
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json(
        { error: 'Directory does not exist' },
        { status: 404 }
      );
    }

    // Create a new archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Create a buffer to collect the zip data
    const chunks: Uint8Array[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    
    // Handle archiver warnings
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        throw err;
      }
    });
    
    // Handle archiver errors
    archive.on('error', (err) => {
      throw err;
    });

    // Read all files in the directory
    const files = fs.readdirSync(dirPath);
    
    // Add each file to the archive
    for (const file of files) {
      if (file.endsWith('.jpg')) {
        const filePath = path.join(dirPath, file);
        const fileStream = fs.createReadStream(filePath);
        archive.append(fileStream, { name: file });
      }
    }
    
    // Finalize the archive
    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', reject);
      archive.finalize();
    });

    // Combine all chunks into one buffer
    const zipBuffer = Buffer.concat(chunks);

    // Return the zip file as a response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${dirName}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating zip file:', error);
    return NextResponse.json(
      { error: 'Failed to create zip file' },
      { status: 500 }
    );
  }
}

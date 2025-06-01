import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

// Adding runtime to explicitly use nodejs runtime
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path;
  console.log('Received slug:', path);
  const filePath = join(process.cwd(), 'public', 'pdf-outputs', ...path);

  // 检查文件是否存在且为文件
  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }

  const stream = fs.createReadStream(filePath);
  return new NextResponse(stream as unknown as BodyInit, {
    headers: { 'Content-Type': 'image/jpeg' }
  });
}

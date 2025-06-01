import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = join(process.cwd(), 'public', 'pdf-outputs', ...params.path);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const stream = createReadStream(filePath);
  return new NextResponse(stream as any, {
    headers: { 'Content-Type': 'image/jpeg' }
  });
}

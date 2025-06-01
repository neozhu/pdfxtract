import { NextResponse } from 'next/server';
import { fromBuffer } from 'pdf2pic';
import * as fs from 'fs';
import * as path from 'path';

// 设置PDF到JPG转换的配置
const qualitySettings = {
  high: {
    width: 1200,
    density: 300,
  },
  medium: {
    width: 1024,
    density: 200,
  },
  low: {
    width: 768,
    density: 150,
  }
};

export const runtime = 'nodejs'; // 设置为 nodejs 运行时，以便可以使用pdf2pic

export async function POST(request: Request) {
  try {
    // 获取表单数据与选项
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = (formData.get('quality') as string) || 'medium';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 获取PDF缓冲区
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      // 创建 web 可访问的静态目录（如 public/pdf-outputs/uuid）
      const outputBaseDir = path.join(process.cwd(), 'public', 'pdf-outputs');
      // 获取原始文件名（去除扩展名）
      const baseName = path.basename(file.name, path.extname(file.name));
      const outputDir = path.join(outputBaseDir, baseName);
      fs.mkdirSync(outputDir, { recursive: true });

      // 设置转换选项
      const settings = qualitySettings[quality as keyof typeof qualitySettings];
      const options = {
        density: settings.density,
        compression: 'jpeg',
        saveFilename: 'page',
        savePath: outputDir,
        format: 'jpg',
        width: settings.width,
        preserveAspectRatio: true
      };

      // 使用pdf2pic进行批量转换（只需一次）
      const convert = fromBuffer(buffer, options);
      await convert.bulk(-1); // -1 转换所有页面，已自动保存到 outputDir

      // 读取 outputDir 下所有 jpg 文件，按页码排序
      const files = fs.readdirSync(outputDir)
        .filter(f => f.endsWith('.jpg'))
        .sort((a, b) => {
          // 提取数字进行排序
          const numA = parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
          const numB = parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
          return numA - numB;
        });
      const imagePaths = files.map(f => `/pdf-outputs/${baseName}/${f}`);

      // 返回图片路径数组（web 可访问路径）
      return NextResponse.json({ imagePaths });
    } catch (conversionError) {
      console.error('PDF conversion error:', conversionError);
      return NextResponse.json(
        { error: 'Failed to convert PDF. The PDF might be corrupted or unsupported.' },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('PDF to JPG conversion error:', error);
    return NextResponse.json(
      { error: 'Error converting PDF to JPG' },
      { status: 500 }
    );
  }
}

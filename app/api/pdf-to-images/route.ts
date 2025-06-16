import { NextResponse } from 'next/server';
import { fromBuffer } from 'pdf2pic';
import * as fs from 'fs';
import * as path from 'path';

// 设置PDF到JPG转换的配置
const qualitySettings = {
  high: {
    width: 1200,
    density: 150,
  },
  medium: {
    width: 1024,
    density: 150,
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
    const format = (formData.get('format') as string) || 'jpg';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 获取PDF缓冲区
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      // 创建输出目录
      const outputBaseDir = path.join(process.cwd(), 'public', 'pdf-outputs');
      const baseName = path.basename(file.name, path.extname(file.name));
      const outputDir = path.join(outputBaseDir, baseName);
      fs.mkdirSync(outputDir, { recursive: true });

      // 设置转换选项
      const settings = qualitySettings[quality as keyof typeof qualitySettings];
      const options = {
        density: settings.density,
        saveFilename: 'page',
        savePath: outputDir,
        format: format,
        width: settings.width,
        preserveAspectRatio: true,
        background: 'white',
        flatten: true,
        alpha: format === 'png' ? 'keep' : 'remove', // PNG 保留透明度
        colorspace: 'sRGB',
        interpolate: 'bilinear',
        antialias: true,
        render: 'intent=relative',
        gravity: 'center',
        extent: `${settings.width}x${Math.round(settings.width * 1.414)}`,
        define: [
          'pdf:use-cropbox=true',
          'pdf:use-trimbox=true',
          'pdf:fit-page=true'
        ]
      };

      // 格式特定的设置
      // pdf2pic 会根据 format 参数自动处理输出格式
      // 不需要额外设置 compression 属性

      // 使用pdf2pic进行批量转换
      const convert = fromBuffer(buffer, options);
      await convert.bulk(-1);

      // 读取输出目录下所有图片文件
      const files = fs.readdirSync(outputDir)
        .filter(f => f.endsWith(`.${format}`))
        .sort((a, b) => {
          const numA = parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
          const numB = parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
          return numA - numB;
        });
      const imagePaths = files.map(f => `/api/pdf-outputs/${baseName}/${f}`);

      // 返回图片路径数组
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


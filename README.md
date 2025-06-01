# PDFxtract

PDFxtract is a modern web application built with Next.js that allows users to upload PDF files and automatically convert each page into JPG images for easy preview and download.


![](/public/screen.png)

## Features

- Upload PDF files via a simple web interface
- Convert each PDF page to high-quality JPG images
- Preview images online after conversion
- Download all images as a ZIP archive
- Responsive and user-friendly UI

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Usage

- Click the upload button on the homepage to select a PDF file
- Wait for the conversion to complete; images will be displayed automatically
- Download all images as a ZIP file if needed

## Project Structure

```
app/                # Next.js app directory
  api/              # API routes for PDF to JPG and ZIP creation
components/         # React components (PDF uploader, UI elements, etc.)
public/             # Static files and output images
lib/                # Utility functions
```

## Build & Deploy

- Build for production: `npm run build`
- Start production server: `npm start`
- Recommended deployment: [Vercel](https://vercel.com/)


## Docker Deployment

### Build Image

```bash
docker build -t pdfxtract:v0.4 .
```

### Run Container

```bash
docker run -d -p 4012:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_GA_ID=<your tag id> \
  --name pdfxtract \
  pdfxtract:v0.4
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  pdfxtract:
    image: pdfxtract:v0.4
    ports:
      - "4012:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_GA_ID=<your tag id>
    restart: unless-stopped
```


## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.


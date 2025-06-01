import { PDFUploader } from "@/components/pdf-uploader";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start w-full pt-2 sm:pt-4">
      <div className="w-full max-w-4xl mx-auto">
        <PDFUploader />
      </div>
    </div>
  );
}

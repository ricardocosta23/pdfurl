import { FileIcon } from "lucide-react";
import UploadSection from "@/components/upload-section";
import FileTable from "@/components/file-table";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <FileIcon className="text-red-500 text-2xl mr-3 h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">PDF Upload & Share</h1>
          </div>
          <p className="text-gray-600 mt-1">Upload PDF files and generate shareable links instantly</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <UploadSection />
        <FileTable />
      </main>
    </div>
  );
}

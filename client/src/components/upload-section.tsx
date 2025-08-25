import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUploadIcon, FileIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function UploadSection() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64 for Vercel serverless functions
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const uniqueFilename = `${file.name.replace('.pdf', '')}-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;
      
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          fileData: fileData.substring(0, 100) + '...[truncated]',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadProgress(45); // Simulate progress
    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CloudUploadIcon className="text-blue-500 mr-2 h-5 w-5" />
          Upload PDF File
        </h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          data-testid="drop-zone"
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <FileIcon className="text-blue-500 text-2xl h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Drop your PDF file here</p>
              <p className="text-gray-500">or click to browse</p>
            </div>
            <div className="flex justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                disabled={uploadMutation.isPending}
                data-testid="button-choose-file"
              >
                Choose File
              </Button>
            </div>
            <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="input-file"
        />

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div className="mt-4" data-testid="upload-progress">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

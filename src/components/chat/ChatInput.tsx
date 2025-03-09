
import React, { useState, useRef } from "react";
import { SendHorizontal, PaperclipIcon, Loader2, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileAttachment } from "./types";
import { toast } from "sonner";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string, files?: File[]) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ isLoading, onSendMessage }) => {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!input.trim() && files.length === 0) || isLoading || isUploading) return;
    onSendMessage(input, files.length > 0 ? files : undefined);
    setInput("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check file types - only allow documents, spreadsheets, PDFs, and images
      const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/vnd.ms-excel',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      const validFiles = selectedFiles.filter(file => 
        allowedTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
      );
      
      if (validFiles.length !== selectedFiles.length) {
        toast.warning("Some files were ignored. Only documents, spreadsheets, PDFs, and images are supported.");
      }
      
      if (validFiles.length + files.length > 5) {
        toast.warning("You can only upload up to 5 files per message.");
        setFiles([...files, ...validFiles.slice(0, 5 - files.length)]);
      } else {
        setFiles([...files, ...validFiles]);
      }
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative space-y-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-1 bg-secondary/50 rounded-md px-2 py-1 text-xs">
              <FileIcon className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                onClick={() => removeFile(index)} 
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 shrink-0" 
          onClick={openFileSelector}
          disabled={isLoading || files.length >= 5}
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-1">
          <Textarea 
            placeholder="Ask about pricing strategies, analyze documents, or upload spreadsheets..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pr-12 resize-none min-h-[80px]"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            className="absolute bottom-3 right-3" 
            onClick={handleSendMessage}
            disabled={((!input.trim() && files.length === 0) || isLoading || isUploading)}
          >
            {isLoading || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,image/jpeg,image/png"
      />
      
      <p className="text-xs text-muted-foreground">
        {files.length === 0 ? 
          "Upload files (PDF, Excel, CSV, Word, text) for analysis" : 
          `${files.length} file${files.length > 1 ? 's' : ''} selected (max 5)`
        }
      </p>
    </div>
  );
};

export default ChatInput;

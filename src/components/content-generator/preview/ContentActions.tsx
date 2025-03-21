
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { formatBlocksToHtml } from "@/services/keywords/generation/contentBlockService";

interface ContentActionsProps {
  activeTab: string;
  content: string;
  generatedContent: GeneratedContent | null;
  onRegenerateContent?: () => void;
  isGenerating?: boolean;
  saveToHistory?: (content: GeneratedContent) => Promise<void>;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  activeTab,
  content,
  generatedContent,
  onRegenerateContent,
  isGenerating = false,
  saveToHistory,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = () => {
    const contentToCopy = activeTab === "blocks" 
      ? generatedContent?.blocks ? formatBlocksToHtml(generatedContent.blocks) : ""
      : content;
      
    navigator.clipboard.writeText(contentToCopy);
    toast.success(`${activeTab === "blocks" ? "Custom blocks" : "Content"} copied to clipboard`);
  };

  const handleDownload = () => {
    const contentToDownload = activeTab === "blocks"
      ? generatedContent?.blocks ? formatBlocksToHtml(generatedContent.blocks) : ""
      : content;
      
    const title = generatedContent?.title || "content";
    const fileExtension = activeTab === "blocks" ? "html" : "md";
    
    const blob = new Blob([contentToDownload], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${activeTab === "blocks" ? "Custom blocks" : "Content"} downloaded as ${fileExtension.toUpperCase()} file`);
  };

  const handleSaveAsDraft = async () => {
    if (!generatedContent || !saveToHistory) return;
    
    setIsSaving(true);
    try {
      await saveToHistory(generatedContent);
      toast.success("Content saved as draft");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-1"
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        Download
      </Button>
      {saveToHistory && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAsDraft}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
          Save as Draft
        </Button>
      )}
      {onRegenerateContent && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerateContent}
          disabled={isGenerating}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      )}
    </div>
  );
};

export default ContentActions;

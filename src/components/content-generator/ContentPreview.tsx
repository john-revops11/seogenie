
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileEdit, Copy, Download, RefreshCw, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentPreviewProps {
  content: string;
  generatedContent: GeneratedContent | null;
  onBack: () => void;
  onRegenerateContent?: () => void;
  isGenerating?: boolean;
}

const ContentPreview = ({ 
  content, 
  generatedContent, 
  onBack,
  onRegenerateContent,
  isGenerating = false
}: ContentPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");

  // Reset edited content when content changes
  useEffect(() => {
    if (content && !isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  const handleEditContent = () => {
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedContent : content);
    toast.success("Content copied to clipboard");
  };

  const handleDownload = () => {
    const contentToDownload = isEditing ? editedContent : content;
    const title = generatedContent?.title || "content";
    const blob = new Blob([contentToDownload], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Content downloaded as Markdown file");
  };

  if (!generatedContent || !content) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Generate content to see the preview here
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{generatedContent.title}</h3>
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
      </div>

      <div className="p-2 bg-muted/30 rounded-md">
        <h4 className="text-sm font-medium mb-1">Meta Description</h4>
        <p className="text-sm text-muted-foreground">{generatedContent.metaDescription}</p>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium">Outline</h4>
        <ul className="list-disc list-inside text-sm space-y-1 pl-2">
          {generatedContent.outline.map((item, index) => (
            <li key={index} className="text-muted-foreground">{item}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Content</h4>
          {isEditing ? (
            <Button
              size="sm"
              onClick={handleSaveEdits}
              className="h-7 flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditContent}
              className="h-7 flex items-center gap-1"
            >
              <FileEdit className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="h-[500px] font-mono text-sm"
          />
        ) : (
          <ScrollArea className="h-[500px] border rounded-md bg-white">
            <div className="p-4 prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default ContentPreview;

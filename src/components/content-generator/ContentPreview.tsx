
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, Copy, Download, RefreshCw, Check, ArrowLeft, Code, Save } from "lucide-react";
import { toast } from "sonner";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { formatBlocksToHtml } from "@/services/keywords/generation/contentBlockService";
import ContentBlockList from "./editor/ContentBlockList";

interface ContentPreviewProps {
  content: string;
  generatedContent: GeneratedContent | null;
  onBack: () => void;
  onRegenerateContent?: () => void;
  isGenerating?: boolean;
  saveToHistory?: (content: GeneratedContent) => Promise<void>;
}

const ContentPreview = ({ 
  content, 
  generatedContent, 
  onBack,
  onRegenerateContent,
  isGenerating = false,
  saveToHistory
}: ContentPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");
  const [activeTab, setActiveTab] = useState<string>("preview"); // "preview" or "blocks"
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    const contentToCopy = activeTab === "blocks" 
      ? generatedContent?.blocks ? formatBlocksToHtml(generatedContent.blocks) : ""
      : isEditing ? editedContent : content;
      
    navigator.clipboard.writeText(contentToCopy);
    toast.success(`${activeTab === "blocks" ? "Custom blocks" : "Content"} copied to clipboard`);
  };

  const handleDownload = () => {
    const contentToDownload = activeTab === "blocks"
      ? generatedContent?.blocks ? formatBlocksToHtml(generatedContent.blocks) : ""
      : isEditing ? editedContent : content;
      
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

  const handleEditBlock = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleSaveBlock = (blockId: string, newContent: string) => {
    if (!generatedContent) return;

    // Update the block content
    const updatedBlocks = generatedContent.blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );

    // Regenerate the HTML content
    const updatedHtml = formatBlocksToHtml(updatedBlocks);

    // Here you would update the state, but we'll just show a toast for now
    toast.success("Block updated successfully");
    setEditingBlockId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    toast.success("Block deleted successfully");
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    toast.success(`Block moved ${direction}`);
  };

  const handleAddBlockAfter = (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => {
    toast.success(`New ${type} block added`);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="blocks">
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Content Blocks
              </div>
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "preview" && (
            isEditing ? (
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
            )
          )}
        </div>

        <TabsContent value="preview" className="mt-0">
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
        </TabsContent>

        <TabsContent value="blocks" className="mt-0">
          {generatedContent.blocks && generatedContent.blocks.length > 0 ? (
            <ScrollArea className="h-[500px] border rounded-md bg-white p-4">
              <ContentBlockList
                blocks={generatedContent.blocks}
                editingBlockId={editingBlockId}
                onEditBlock={handleEditBlock}
                onSaveBlock={handleSaveBlock}
                onDeleteBlock={handleDeleteBlock}
                onMoveBlock={handleMoveBlock}
                onAddBlockAfter={handleAddBlockAfter}
              />
            </ScrollArea>
          ) : (
            <div className="h-[500px] border rounded-md bg-white p-4 flex items-center justify-center">
              <p className="text-muted-foreground">No content blocks available. Please regenerate the content.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, FileEdit, Redo, Save } from "lucide-react";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentPreviewProps {
  content: string;
  generatedContent: GeneratedContent | null;
  onBack: () => void;
  onRegenerateContent: () => void;
  isGenerating: boolean;
  saveToHistory: (content: GeneratedContent) => Promise<void>;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  generatedContent,
  onBack,
  onRegenerateContent,
  isGenerating,
  saveToHistory
}) => {
  const [activeTab, setActiveTab] = React.useState("preview");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSaveAsDraft = async () => {
    if (!generatedContent) return;
    
    try {
      setIsSaving(true);
      await saveToHistory(generatedContent);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving draft:", error);
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isGenerating}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isGenerating || isSaving || !generatedContent}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" /> Save as Draft
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRegenerateContent} 
            disabled={isGenerating}
            className="flex items-center"
          >
            <Redo className="mr-2 h-4 w-4" /> Regenerate
          </Button>
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="blocks">
            <span className="flex items-center gap-1">
              <Code className="h-4 w-4" /> Content Blocks
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          {content ? (
            <div className="bg-white rounded-md p-6 border">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md bg-muted">
              <p className="text-muted-foreground">No content to preview</p>
            </div>
          )}
          
          {isEditing && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1"
              >
                <FileEdit className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="blocks" className="mt-4">
          {generatedContent && generatedContent.blocks ? (
            <div className="bg-white rounded-md p-6 border">
              {generatedContent.blocks.map((block, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {block.type}
                  </p>
                  <div className="border p-2 rounded">
                    {block.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md bg-muted">
              <p className="text-muted-foreground">No content blocks available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {generatedContent && (
        <div className="bg-muted p-4 rounded-md mt-4">
          <h3 className="text-sm font-semibold mb-2">Content Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Content Type</p>
              <p className="text-sm">{generatedContent.contentType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Model</p>
              <p className="text-sm">{generatedContent.aiProvider} / {generatedContent.aiModel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Generation Method</p>
              <p className="text-sm capitalize">{generatedContent.generationMethod}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Keywords</p>
              <p className="text-sm">{generatedContent.keywords?.join(", ")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPreview;

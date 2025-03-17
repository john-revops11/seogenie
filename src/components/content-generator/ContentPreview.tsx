
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, FileEdit } from "lucide-react";
import { GeneratedContent } from "@/services/keywords/types";
import ContentActions from "./preview/ContentActions";
import ContentMetaInfo from "./preview/ContentMetaInfo";
import ContentPreviewTab from "./preview/ContentPreviewTab";
import ContentBlocksTab from "./preview/ContentBlocksTab";

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
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");
  
  useEffect(() => {
    if (content) {
      setEditedContent(content);
    }
  }, [content]);

  if (!generatedContent || !content) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Generate content to see the preview here
      </div>
    );
  }
  
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
        
        <ContentActions 
          activeTab={activeTab}
          content={isEditing ? editedContent : content}
          generatedContent={generatedContent}
          onRegenerateContent={onRegenerateContent}
          isGenerating={isGenerating}
          saveToHistory={saveToHistory}
        />
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
          <ContentPreviewTab 
            content={content}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </TabsContent>
        
        <TabsContent value="blocks" className="mt-4">
          <ContentBlocksTab generatedContent={generatedContent} />
        </TabsContent>
      </Tabs>
      
      {generatedContent && (
        <ContentMetaInfo generatedContent={generatedContent} />
      )}
    </div>
  );
};

export default ContentPreview;

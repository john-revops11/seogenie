
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, FileEdit } from "lucide-react";
import { GeneratedContent } from "@/services/keywords/types";
import ContentActions from "./preview/ContentActions";
import ContentMetaInfo from "./preview/ContentMetaInfo";

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
          content={content}
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
        <ContentMetaInfo generatedContent={generatedContent} />
      )}
    </div>
  );
};

export default ContentPreview;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code } from "lucide-react";
import { GeneratedContent } from "@/services/keywords/types";
import ContentActions from "./preview/ContentActions";
import ContentPreviewTab from "./preview/ContentPreviewTab";
import ContentBlocksTab from "./preview/ContentBlocksTab";
import ContentMetaInfo from "./preview/ContentMetaInfo";

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
  const [activeTab, setActiveTab] = useState<string>("preview"); // "preview" or "blocks"

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
        <ContentActions 
          activeTab={activeTab}
          content={content}
          generatedContent={generatedContent}
          onRegenerateContent={onRegenerateContent}
          isGenerating={isGenerating}
          saveToHistory={saveToHistory}
        />
      </div>

      <ContentMetaInfo generatedContent={generatedContent} />

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
              <div /> {/* Empty div to maintain layout */}
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-7 flex items-center gap-1"
              >
                <FileEdit className="h-3.5 w-3.5" />
                Edit
              </Button>
            )
          )}
        </div>

        <TabsContent value="preview" className="mt-0">
          <ContentPreviewTab 
            content={content}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </TabsContent>

        <TabsContent value="blocks" className="mt-0">
          <ContentBlocksTab generatedContent={generatedContent} />
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

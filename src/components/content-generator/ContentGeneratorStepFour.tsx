
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentEditor from "./ContentEditor";
import { GeneratedContent as GeneratedContentType } from "@/services/keywords/types";

interface ContentGeneratorStepFourProps {
  generatedContent: {
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null;
  generatedContentData: GeneratedContentType | null;
  contentType: string;
  onContentUpdate: (content: GeneratedContentType) => void;
  onBack: () => void;
}

const ContentGeneratorStepFour: React.FC<ContentGeneratorStepFourProps> = ({
  generatedContent,
  generatedContentData,
  contentType,
  onContentUpdate,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 4: Edit Content</h3>
      
      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Block Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          {generatedContentData && (
            <ContentEditor 
              generatedContent={generatedContentData}
              onContentUpdate={onContentUpdate}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepFour;

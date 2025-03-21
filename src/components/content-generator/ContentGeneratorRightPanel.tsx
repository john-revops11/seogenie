
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentEditor from "./ContentEditor";
import GeneratedContent from "./GeneratedContent";
import { GeneratedContent as GeneratedContentType } from "@/services/keywords/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentGeneratorRightPanelProps {
  showEditor: boolean;
  generatedContent: {
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null;
  generatedContentData: GeneratedContentType | null;
  contentType: string;
  onContentUpdate: (content: GeneratedContentType) => void;
}

const ContentGeneratorRightPanel: React.FC<ContentGeneratorRightPanelProps> = ({
  showEditor,
  generatedContent,
  generatedContentData,
  contentType,
  onContentUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Block Editor */}
      {showEditor && generatedContentData && (
        <Card>
          <CardHeader>
            <CardTitle>Content Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Block Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor">
                <ContentEditor 
                  generatedContent={generatedContentData}
                  onUpdateContent={onContentUpdate}
                />
              </TabsContent>
              
              <TabsContent value="preview">
                {generatedContent && (
                  <GeneratedContent 
                    generatedContent={generatedContent} 
                    contentType={contentType} 
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Preview Card - only show when editor not visible */}
      {generatedContent && !showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <GeneratedContent 
              generatedContent={generatedContent} 
              contentType={contentType} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGeneratorRightPanel;

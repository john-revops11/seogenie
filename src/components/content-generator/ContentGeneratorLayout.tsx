
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, History } from "lucide-react";

interface ContentGeneratorLayoutProps {
  activeTab: "generator" | "history";
  onTabChange: (value: "generator" | "history") => void;
  generatorContent: ReactNode;
  historyContent: ReactNode;
  editorContent?: ReactNode;
  previewContent?: ReactNode;
  shouldShowRightPanel: boolean;
}

const ContentGeneratorLayout: React.FC<ContentGeneratorLayoutProps> = ({
  activeTab,
  onTabChange,
  generatorContent,
  historyContent,
  editorContent,
  previewContent,
  shouldShowRightPanel
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>AI Content Generator</CardTitle>
              <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "generator" | "history")} className="ml-auto">
                <TabsList>
                  <TabsTrigger value="generator" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Generator
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "generator" ? generatorContent : historyContent}
          </CardContent>
        </Card>
      </div>
      
      {shouldShowRightPanel && activeTab === "generator" && (
        <div className="space-y-6">
          {/* Block Editor - Only show when appropriate */}
          {editorContent}

          {/* Preview Card */}
          {previewContent}
        </div>
      )}
    </div>
  );
};

export default ContentGeneratorLayout;

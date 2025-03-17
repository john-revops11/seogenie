
import React, { useEffect } from "react";
import ContentGeneratorContainer from "./content-generator/ContentGeneratorContainer";
import { useContentHistory } from "@/hooks/content-generator/useContentHistory";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from "./page/TabNavigation";
import { useNavigate, useLocation } from "react-router-dom";

interface ContentGeneratorProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = ""
}) => {
  const { saveToHistory } = useContentHistory();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleValueChange = (value: string) => {
    navigate(`/${value}`);
  };

  return (
    <div className="w-full px-4 py-6 space-y-6">
      <Tabs 
        defaultValue="content" 
        className="w-full" 
        onValueChange={handleValueChange}
        value="content"
      >
        <TabNavigation />
        
        <TabsContent value="content" className="pt-6">
          <ContentGeneratorContainer 
            domain={domain}
            selectedKeywords={selectedKeywords}
            initialTitle={initialTitle}
            saveToHistory={saveToHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentGenerator;

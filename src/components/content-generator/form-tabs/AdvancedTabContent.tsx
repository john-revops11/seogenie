
import React from "react";
import { Label } from "@/components/ui/label";
import { Settings, Database, FileText, ListChecks } from "lucide-react";
import { RagSettings } from "../RagSettings";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AdvancedTabContentProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
  selectedKeywords?: string[];
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  ragEnabled,
  onRagToggle,
  selectedKeywords = [],
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base">Advanced Settings</Label>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="h-4 w-4" />
        <AlertTitle>SEO-Optimized Structured Content</AlertTitle>
        <AlertDescription className="text-xs">
          Content will be generated following SEO best practices with a clear structure: 
          H1 title, concise introduction, logical H2/H3 sections, properly formatted lists, real-world examples, 
          best practices, and a conclusion with next steps.
        </AlertDescription>
      </Alert>
      
      <Accordion type="single" collapsible className="w-full border rounded-md">
        <AccordionItem value="structure">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Article Structure Guidelines
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 text-xs space-y-3">
            <div>
              <p className="font-semibold">H1 (Main Title):</p>
              <p>Clearly incorporates the primary keyword/topic to optimize SEO and clarity.</p>
            </div>
            
            <div>
              <p className="font-semibold">Introduction:</p>
              <p>Concise, informative paragraph (50-100 words) that sets the context, purpose, and key takeaways.</p>
            </div>
            
            <div>
              <p className="font-semibold">Main Sections:</p>
              <p>Content is organized with H2 headings for main topics and H3 subheadings for deeper details.</p>
            </div>
            
            <div>
              <p className="font-semibold">Formatted Content:</p>
              <ul className="list-disc pl-5">
                <li>Structured paragraphs (3-4 sentences max)</li>
                <li>Bulleted lists for features, benefits, key points</li>
                <li>Numbered lists for sequential steps or processes</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold">Case Studies & Examples:</p>
              <p>At least one clearly formatted, relevant real-world example demonstrating practical application.</p>
            </div>
            
            <div>
              <p className="font-semibold">Best Practices:</p>
              <p>A neatly formatted list of actionable recommendations and key insights.</p>
            </div>
            
            <div>
              <p className="font-semibold">Conclusion:</p>
              <p>Concise summary reinforcing key insights and recommending actionable next steps.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <RagSettings 
        enabled={ragEnabled} 
        onToggle={onRagToggle}
      />
      
      {selectedKeywords.length > 0 && (
        <div className="space-y-2 p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm">RAG Knowledge Base Keywords</Label>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedKeywords.map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            These keywords will be used to retrieve relevant knowledge from the vector database when RAG is enabled.
          </p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedTabContent;

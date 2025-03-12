
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateContentOutline } from "@/services/vector/contentOutlineGenerator";

interface SubheadingRecommendationsProps {
  title: string;
  keywords: string[];
  contentType: string;
  onSubheadingsSelected: (subheadings: string[]) => void;
  onBack: () => void;
}

const SubheadingRecommendations: React.FC<SubheadingRecommendationsProps> = ({
  title,
  keywords,
  contentType,
  onSubheadingsSelected,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedSubheadings, setSuggestedSubheadings] = useState<string[]>([]);
  const [selectedSubheadings, setSelectedSubheadings] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubheadings = async () => {
      setIsLoading(true);
      try {
        const outline = await generateContentOutline(title, keywords, contentType);
        setSuggestedSubheadings(outline.headings);
        // Select all by default
        setSelectedSubheadings(outline.headings);
      } catch (error) {
        console.error("Error generating subheadings:", error);
        toast.error("Failed to generate subheadings. Please try again.");
        // Provide some fallback headings
        const fallbackHeadings = [
          "Introduction",
          "The Problem",
          "The Process",
          "The Payoff",
          "Conclusion"
        ];
        setSuggestedSubheadings(fallbackHeadings);
        setSelectedSubheadings(fallbackHeadings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubheadings();
  }, [title, keywords, contentType]);

  const handleSubheadingToggle = (heading: string) => {
    setSelectedSubheadings(prev => 
      prev.includes(heading) 
        ? prev.filter(h => h !== heading) 
        : [...prev, heading]
    );
  };

  const handleContinue = () => {
    if (selectedSubheadings.length === 0) {
      toast.error("Please select at least one subheading");
      return;
    }
    onSubheadingsSelected(selectedSubheadings);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Recommended Subheadings</h3>
      <p className="text-sm text-muted-foreground">
        Select the subheadings you want to include in your content. You can customize this list before generating the full content.
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Generating subheadings...</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
          {suggestedSubheadings.map((heading, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/40">
              <Checkbox 
                id={`heading-${index}`} 
                checked={selectedSubheadings.includes(heading)}
                onCheckedChange={() => handleSubheadingToggle(heading)}
              />
              <Label 
                htmlFor={`heading-${index}`}
                className="cursor-pointer font-medium"
              >
                {heading}
              </Label>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isLoading || selectedSubheadings.length === 0}
        >
          Continue with Selected Subheadings
        </Button>
      </div>
    </div>
  );
};

export default SubheadingRecommendations;

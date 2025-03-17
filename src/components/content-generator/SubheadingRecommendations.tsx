
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { generateContentOutline } from "@/services/vector/contentOutlineGenerator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [suggestedSubheadings, setSuggestedSubheadings] = useState<string[]>([]);
  const [selectedSubheadings, setSelectedSubheadings] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedHeading, setEditedHeading] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [regenerationCount, setRegenerationCount] = useState(0);

  useEffect(() => {
    fetchSubheadings();
  }, [title, keywords, contentType]);

  // Modified to use the regeneration count to force variety
  const fetchSubheadings = async () => {
    setIsLoading(true);
    try {
      // Pass regenerationCount to ensure different results on regeneration
      const outline = await generateContentOutline(title, keywords, contentType, regenerationCount);
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

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedHeading(suggestedSubheadings[index]);
  };

  const handleSaveEdit = () => {
    if (editIndex === null) return;
    if (!editedHeading.trim()) {
      toast.error("Subheading cannot be empty");
      return;
    }

    const updatedHeadings = [...suggestedSubheadings];
    updatedHeadings[editIndex] = editedHeading;
    setSuggestedSubheadings(updatedHeadings);

    // Update selected headings if this one was selected
    if (selectedSubheadings.includes(suggestedSubheadings[editIndex])) {
      setSelectedSubheadings(prev => 
        prev.map(h => h === suggestedSubheadings[editIndex] ? editedHeading : h)
      );
    }

    setEditIndex(null);
    setEditedHeading("");
    toast.success("Subheading updated");
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedHeading("");
  };

  // Improved regenerate function that ensures new variations
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // Increment the regeneration counter to force variation
      setRegenerationCount(prev => prev + 1);
      // Wait a brief moment to ensure state update
      setTimeout(async () => {
        await fetchSubheadings();
        toast.success("Subheadings regenerated with new variations");
        setIsRegenerating(false);
      }, 100);
    } catch (error) {
      console.error("Error regenerating subheadings:", error);
      toast.error("Failed to regenerate subheadings");
      setIsRegenerating(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsRegenerating(true);
    setIsPromptDialogOpen(false);
    
    try {
      // Create a more detailed implementation to use the custom prompt
      const processedPrompt = `Using the Revology Analytics content framework (Problem, Process, Payoff, Proposition) and focusing on ${title}, please generate subheadings for a ${contentType} that incorporates these keywords: ${keywords.join(', ')}. Custom instructions: ${customPrompt}`;
      
      console.log("Using custom prompt:", processedPrompt);
      toast.info("Generating subheadings from your custom prompt...");
      
      // We'll pass a special flag to the generate function to use the custom prompt
      const outline = await generateContentOutline(
        title, 
        keywords, 
        contentType, 
        regenerationCount, 
        processedPrompt
      );
      
      toast.success("Generated subheadings from your custom prompt");
      
      setSuggestedSubheadings(outline.headings);
      setSelectedSubheadings(outline.headings);
    } catch (error) {
      console.error("Error generating subheadings from prompt:", error);
      toast.error("Failed to generate subheadings from prompt");
    } finally {
      setIsRegenerating(false);
      setCustomPrompt("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recommended Subheadings</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPromptDialogOpen(true)}
            disabled={isLoading || isRegenerating}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Custom Prompt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isLoading || isRegenerating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Select the subheadings you want to include in your content. You can customize this list before generating the full content.
      </p>
      
      {isLoading || isRegenerating ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">
            {isLoading ? "Generating subheadings..." : "Regenerating subheadings..."}
          </span>
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
              {editIndex === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editedHeading}
                    onChange={(e) => setEditedHeading(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                </div>
              ) : (
                <>
                  <Label 
                    htmlFor={`heading-${index}`}
                    className="cursor-pointer font-medium flex-1"
                  >
                    {heading}
                  </Label>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditClick(index)}
                    className="h-8 w-8 opacity-70 hover:opacity-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading || isRegenerating}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isLoading || isRegenerating || selectedSubheadings.length === 0}
        >
          Continue with Selected Subheadings
        </Button>
      </div>

      {/* Custom Prompt Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Generate Custom Subheadings</DialogTitle>
            <DialogDescription>
              Enter a prompt to generate specific subheadings for your content based on Revology Analytics' content framework.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Create subheadings focusing on data-driven insights and ROI metrics for manufacturing analytics"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <h4 className="font-medium mb-2">Content Framework Information:</h4>
              <p className="mb-2">Your subheadings will follow the Revology Analytics framework:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-medium">Problem:</span> Identify industry challenges</li>
                <li><span className="font-medium">Process:</span> Outline Revology's approach</li>
                <li><span className="font-medium">Payoff:</span> Highlight benefits and results</li>
                <li><span className="font-medium">Proposition:</span> Call to action</li>
              </ul>
              <div className="mt-2 pt-2 border-t border-muted">
                <p>Title: {title}</p>
                <p>Content Type: {contentType}</p>
                <p>Keywords: {keywords.join(", ")}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateFromPrompt}
              disabled={!customPrompt.trim()}
            >
              Generate Subheadings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubheadingRecommendations;

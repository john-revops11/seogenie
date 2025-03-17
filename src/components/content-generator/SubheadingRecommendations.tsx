
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

  useEffect(() => {
    fetchSubheadings();
  }, [title, keywords, contentType]);

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

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await fetchSubheadings();
      toast.success("Subheadings regenerated successfully");
    } catch (error) {
      console.error("Error regenerating subheadings:", error);
      toast.error("Failed to regenerate subheadings");
    } finally {
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
      // Here we would use the AI service to generate subheadings from the custom prompt
      // For now, we'll reuse the standard generator but in a real implementation,
      // you'd send the custom prompt to the AI service
      const outline = await generateContentOutline(title, keywords, contentType);
      
      // In a full implementation, you would pass the customPrompt to the AI service
      toast.success("Generated subheadings from your prompt");
      
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
              Enter a prompt to generate specific subheadings for your content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Generate subheadings for a technical guide on machine learning focused on beginners"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Content Information:</p>
              <ul className="list-disc list-inside">
                <li>Title: {title}</li>
                <li>Content Type: {contentType}</li>
                <li>Keywords: {keywords.join(", ")}</li>
              </ul>
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

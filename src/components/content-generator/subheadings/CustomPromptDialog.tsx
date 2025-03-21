
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CustomPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
  onGenerateFromPrompt: () => void;
  title: string;
  contentType: string;
  keywords: string[];
}

const CustomPromptDialog: React.FC<CustomPromptDialogProps> = ({
  isOpen,
  onOpenChange,
  customPrompt,
  onCustomPromptChange,
  onGenerateFromPrompt,
  title,
  contentType,
  keywords,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => onCustomPromptChange(e.target.value)}
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onGenerateFromPrompt}
            disabled={!customPrompt.trim()}
          >
            Generate Subheadings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPromptDialog;


import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SubheadingsList from "./subheadings/SubheadingsList";
import SubheadingActions from "./subheadings/SubheadingActions";
import CustomPromptDialog from "./subheadings/CustomPromptDialog";
import { useSubheadingRecommendations } from "@/hooks/content-generator/useSubheadingRecommendations";
import SubheadingsHeader from "./subheadings/SubheadingsHeader";

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
  const {
    isLoading,
    isRegenerating,
    suggestedSubheadings,
    selectedSubheadings,
    editIndex,
    editedHeading,
    isPromptDialogOpen,
    customPrompt,
    setEditedHeading,
    setIsPromptDialogOpen,
    setCustomPrompt,
    handleSubheadingToggle,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleRegenerate,
    handleGenerateFromPrompt
  } = useSubheadingRecommendations(title, keywords, contentType);

  const handleContinue = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (selectedSubheadings.length === 0) {
      toast.error("Please select at least one subheading");
      return;
    }
    onSubheadingsSelected(selectedSubheadings);
  };

  return (
    <div className="space-y-6">
      <SubheadingsHeader 
        isLoading={isLoading}
        isRegenerating={isRegenerating}
        onOpenPromptDialog={() => setIsPromptDialogOpen(true)}
        onRegenerate={handleRegenerate}
      />
      
      <SubheadingsList 
        isLoading={isLoading}
        isRegenerating={isRegenerating}
        suggestedSubheadings={suggestedSubheadings}
        selectedSubheadings={selectedSubheadings}
        editIndex={editIndex}
        editedHeading={editedHeading}
        onSubheadingToggle={handleSubheadingToggle}
        onEditClick={handleEditClick}
        onEditChange={setEditedHeading}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          type="button"
          disabled={isLoading || isRegenerating}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          type="button"
          disabled={isLoading || isRegenerating || selectedSubheadings.length === 0}
        >
          Continue with Selected Subheadings
        </Button>
      </div>

      <CustomPromptDialog 
        isOpen={isPromptDialogOpen}
        onOpenChange={setIsPromptDialogOpen}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
        onGenerateFromPrompt={handleGenerateFromPrompt}
        title={title}
        contentType={contentType}
        keywords={keywords}
      />
    </div>
  );
};

export default SubheadingRecommendations;

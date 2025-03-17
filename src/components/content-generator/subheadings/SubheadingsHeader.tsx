
import React from "react";
import SubheadingActions from "./SubheadingActions";

interface SubheadingsHeaderProps {
  isLoading: boolean;
  isRegenerating: boolean;
  onOpenPromptDialog: () => void;
  onRegenerate: () => void;
}

const SubheadingsHeader: React.FC<SubheadingsHeaderProps> = ({
  isLoading,
  isRegenerating,
  onOpenPromptDialog,
  onRegenerate
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">Recommended Subheadings</h3>
        <p className="text-sm text-muted-foreground">
          Select the subheadings you want to include in your content. You can customize this list before generating the full content.
        </p>
      </div>
      <SubheadingActions 
        isLoading={isLoading}
        isRegenerating={isRegenerating}
        onOpenPromptDialog={onOpenPromptDialog}
        onRegenerate={onRegenerate}
      />
    </div>
  );
};

export default SubheadingsHeader;

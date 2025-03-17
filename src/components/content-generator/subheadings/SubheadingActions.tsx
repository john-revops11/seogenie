
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw } from "lucide-react";

interface SubheadingActionsProps {
  isLoading: boolean;
  isRegenerating: boolean;
  onOpenPromptDialog: () => void;
  onRegenerate: () => void;
}

const SubheadingActions: React.FC<SubheadingActionsProps> = ({
  isLoading,
  isRegenerating,
  onOpenPromptDialog,
  onRegenerate,
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenPromptDialog}
        disabled={isLoading || isRegenerating}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Custom Prompt
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={isLoading || isRegenerating}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        Regenerate
      </Button>
    </div>
  );
};

export default SubheadingActions;

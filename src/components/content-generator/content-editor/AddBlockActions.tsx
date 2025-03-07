
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, List, ListOrdered, FileUp } from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";
import { toast } from "sonner";

interface AddBlockActionsProps {
  lastBlockId: string;
  onAddBlock: (blockId: string, type: ContentBlock['type'] | 'list' | 'orderedList') => void;
  getFullHtmlContent: () => string;
}

const AddBlockActions: React.FC<AddBlockActionsProps> = ({
  lastBlockId,
  onAddBlock,
  getFullHtmlContent
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t">
      <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddBlock(lastBlockId, 'heading2')}
        >
          <Plus className="w-4 h-4 mr-1" /> H2 Heading
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddBlock(lastBlockId, 'heading3')}
        >
          <Plus className="w-4 h-4 mr-1" /> H3 Heading
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddBlock(lastBlockId, 'paragraph')}
        >
          <Plus className="w-4 h-4 mr-1" /> Paragraph
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddBlock(lastBlockId, 'list')}
        >
          <List className="w-4 h-4 mr-1" /> Bullet List
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddBlock(lastBlockId, 'orderedList')}
        >
          <ListOrdered className="w-4 h-4 mr-1" /> Numbered List
        </Button>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          const contentHtml = getFullHtmlContent();
          navigator.clipboard.writeText(contentHtml);
          toast.success("Content copied to clipboard");
        }}
      >
        <FileUp className="w-4 h-4 mr-1" /> Export HTML
      </Button>
    </div>
  );
};

export default AddBlockActions;

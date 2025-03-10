
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, List, ListOrdered } from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";

interface ContentEditorToolbarProps {
  onAddBlock: (type: ContentBlock['type'] | 'list' | 'orderedList') => void;
}

const ContentEditorToolbar: React.FC<ContentEditorToolbarProps> = ({ onAddBlock }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('heading2')}
      >
        <Plus className="w-4 h-4 mr-1" /> H2 Heading
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('heading3')}
      >
        <Plus className="w-4 h-4 mr-1" /> H3 Heading
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('paragraph')}
      >
        <Plus className="w-4 h-4 mr-1" /> Paragraph
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('list')}
      >
        <List className="w-4 h-4 mr-1" /> Bullet List
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('orderedList')}
      >
        <ListOrdered className="w-4 h-4 mr-1" /> Numbered List
      </Button>
    </div>
  );
};

export default ContentEditorToolbar;

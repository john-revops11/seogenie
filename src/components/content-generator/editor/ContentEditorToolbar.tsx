
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  List, 
  ListOrdered, 
  Quote 
} from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";

interface ContentEditorToolbarProps {
  onAddBlock: (type: ContentBlock['type'] | 'list' | 'orderedList') => void;
}

const ContentEditorToolbar: React.FC<ContentEditorToolbarProps> = ({ onAddBlock }) => {
  return (
    <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-md">
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('heading1')}
        className="flex items-center gap-1"
      >
        <Heading1 className="h-4 w-4" />
        <span>H1</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('heading2')}
        className="flex items-center gap-1"
      >
        <Heading2 className="h-4 w-4" />
        <span>H2</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('heading3')}
        className="flex items-center gap-1"
      >
        <Heading3 className="h-4 w-4" />
        <span>H3</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('paragraph')}
        className="flex items-center gap-1"
      >
        <AlignLeft className="h-4 w-4" />
        <span>Paragraph</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('list')}
        className="flex items-center gap-1"
      >
        <List className="h-4 w-4" />
        <span>Bullet List</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('orderedList')}
        className="flex items-center gap-1"
      >
        <ListOrdered className="h-4 w-4" />
        <span>Numbered List</span>
      </Button>
      
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => onAddBlock('quote')}
        className="flex items-center gap-1"
      >
        <Quote className="h-4 w-4" />
        <span>Quote</span>
      </Button>
    </div>
  );
};

export default ContentEditorToolbar;

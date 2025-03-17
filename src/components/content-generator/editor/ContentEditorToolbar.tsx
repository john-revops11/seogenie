
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  Quote
} from "lucide-react";
import { ContentBlock } from "@/services/keywords/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ContentEditorToolbarProps {
  onAddBlock: (type: ContentBlock['type'] | 'list' | 'orderedList') => void;
}

const ContentEditorToolbar: React.FC<ContentEditorToolbarProps> = ({ onAddBlock }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Heading2 className="w-4 h-4 mr-1" /> Add Heading
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onAddBlock('heading1')}>
              <Heading1 className="w-4 h-4 mr-2" />
              <span>H1 Heading</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('heading2')}>
              <Heading2 className="w-4 h-4 mr-2" />
              <span>H2 Heading</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddBlock('heading3')}>
              <Heading3 className="w-4 h-4 mr-2" />
              <span>H3 Heading</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('paragraph')}
      >
        <Type className="w-4 h-4 mr-1" /> Paragraph
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
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBlock('quote')}
      >
        <Quote className="w-4 h-4 mr-1" /> Quote
      </Button>
    </div>
  );
};

export default ContentEditorToolbar;

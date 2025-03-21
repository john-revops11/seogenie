
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignJustify
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ContentBlockEditingToolbarProps {
  onApplyFormatting: (format: string) => void;
  disabled?: boolean;
}

const ContentBlockEditingToolbar: React.FC<ContentBlockEditingToolbarProps> = ({
  onApplyFormatting,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md mb-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('bold')}
          disabled={disabled}
          className="h-8 px-2"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('italic')}
          disabled={disabled}
          className="h-8 px-2"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-8" />
      
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('h1')}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('h2')}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('h3')}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-8" />
      
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('ul')}
          disabled={disabled}
          className="h-8 px-2"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('ol')}
          disabled={disabled}
          className="h-8 px-2"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('quote')}
          disabled={disabled}
          className="h-8 px-2"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-8" />
      
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('alignLeft')}
          disabled={disabled}
          className="h-8 px-2"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('alignCenter')}
          disabled={disabled}
          className="h-8 px-2"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onApplyFormatting('alignJustify')}
          disabled={disabled}
          className="h-8 px-2"
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContentBlockEditingToolbar;

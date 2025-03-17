
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";

interface SubheadingItemProps {
  heading: string;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  editedHeading: string;
  onToggle: (heading: string) => void;
  onEditClick: (index: number) => void;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const SubheadingItem: React.FC<SubheadingItemProps> = ({
  heading,
  index,
  isSelected,
  isEditing,
  editedHeading,
  onToggle,
  onEditClick,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  return (
    <div className="flex items-start space-x-2 p-2 rounded hover:bg-muted/40">
      <Checkbox 
        id={`heading-${index}`} 
        checked={isSelected}
        onCheckedChange={() => onToggle(heading)}
      />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editedHeading}
            onChange={(e) => onEditChange(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" onClick={onSaveEdit}>Save</Button>
          <Button size="sm" variant="outline" onClick={onCancelEdit}>Cancel</Button>
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
            onClick={() => onEditClick(index)}
            className="h-8 w-8 opacity-70 hover:opacity-100"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default SubheadingItem;

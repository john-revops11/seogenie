
import React from "react";
import { Loader2 } from "lucide-react";
import SubheadingItem from "./SubheadingItem";

interface SubheadingsListProps {
  isLoading: boolean;
  isRegenerating: boolean;
  suggestedSubheadings: string[];
  selectedSubheadings: string[];
  editIndex: number | null;
  editedHeading: string;
  onSubheadingToggle: (heading: string) => void;
  onEditClick: (index: number) => void;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const SubheadingsList: React.FC<SubheadingsListProps> = ({
  isLoading,
  isRegenerating,
  suggestedSubheadings,
  selectedSubheadings,
  editIndex,
  editedHeading,
  onSubheadingToggle,
  onEditClick,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  if (isLoading || isRegenerating) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">
          {isLoading ? "Generating subheadings..." : "Regenerating subheadings..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
      {suggestedSubheadings.map((heading, index) => (
        <SubheadingItem
          key={index}
          heading={heading}
          index={index}
          isSelected={selectedSubheadings.includes(heading)}
          isEditing={editIndex === index}
          editedHeading={editedHeading}
          onToggle={onSubheadingToggle}
          onEditClick={onEditClick}
          onEditChange={onEditChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </div>
  );
};

export default SubheadingsList;

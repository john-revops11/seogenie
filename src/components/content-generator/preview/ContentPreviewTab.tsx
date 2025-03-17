
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, FileEdit } from "lucide-react";
import { toast } from "sonner";

interface ContentPreviewTabProps {
  content: string;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContentPreviewTab: React.FC<ContentPreviewTabProps> = ({
  content,
  isEditing,
  setIsEditing
}) => {
  const [editedContent, setEditedContent] = useState(content || "");

  useEffect(() => {
    if (content && !isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  const handleEditContent = () => {
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  return (
    <div>
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="h-[500px] font-mono text-sm"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveEdits}
              className="h-7 flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <ScrollArea className="h-[500px] border rounded-md bg-white">
            <div className="p-4 prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ContentPreviewTab;

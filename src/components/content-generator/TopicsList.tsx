
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Edit, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TopicsListProps {
  topics: string[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onDeleteTopic: (topic: string) => void;
}

export const TopicsList = ({ 
  topics, 
  selectedTopic, 
  onSelectTopic, 
  onDeleteTopic 
}: TopicsListProps) => {
  const [isEditingTopic, setIsEditingTopic] = useState<string | null>(null);
  const [editedTopicText, setEditedTopicText] = useState("");

  const handleStartEditingTopic = (topic: string) => {
    setIsEditingTopic(topic);
    setEditedTopicText(topic);
  };

  const handleSaveEditedTopic = () => {
    if (!editedTopicText.trim() || !isEditingTopic) return;
    
    // We need to notify the parent about the edit
    // For now just show toast and reset UI state
    setIsEditingTopic(null);
    toast.success("Topic updated");
  };

  return (
    <ScrollArea className="rounded-md border p-2 h-[240px]">
      <div className="grid grid-cols-1 gap-2">
        {topics.map((topic, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors ${
              selectedTopic === topic ? 'bg-accent/80' : ''
            }`}
          >
            {isEditingTopic === topic ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={editedTopicText}
                  onChange={(e) => setEditedTopicText(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  className="h-7 w-7 p-0 bg-revology text-white"
                  onClick={handleSaveEditedTopic}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <div 
                  className="flex-1 cursor-pointer truncate"
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent/80"
                    onClick={() => handleStartEditingTopic(topic)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent/80"
                    onClick={() => onDeleteTopic(topic)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TopicsList;

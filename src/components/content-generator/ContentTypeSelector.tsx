
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, BookOpen, FileCheck, FileSpreadsheet } from "lucide-react";

interface ContentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  value,
  onChange
}) => {
  const contentTypes = [
    {
      id: "blog",
      name: "Blog Post",
      icon: <FileText className="h-4 w-4 mr-2" />,
      description: "General purpose blog content"
    },
    {
      id: "how-to",
      name: "How-To Guide",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      description: "Step-by-step tutorial format" 
    },
    {
      id: "case-study",
      name: "Case Study",
      icon: <FileCheck className="h-4 w-4 mr-2" />,
      description: "Success story with results" 
    },
    {
      id: "white-paper",
      name: "White Paper",
      icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
      description: "Research-based industry paper" 
    }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="content-type">Content Type</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="content-type">
          <SelectValue placeholder="Select content type" />
        </SelectTrigger>
        <SelectContent>
          {contentTypes.map(type => (
            <SelectItem 
              key={type.id} 
              value={type.id}
            >
              <div className="flex items-center">
                {type.icon}
                <span>{type.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {contentTypes.find(type => type.id === value)?.description || 
          "Select a content type to continue"}
      </p>
    </div>
  );
};

export default ContentTypeSelector;

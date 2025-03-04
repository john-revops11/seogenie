
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddApiDialogProps {
  onAdd: (name: string, key: string, description: string) => void;
  onClose: () => void;
}

export const AddApiDialog = ({ onAdd, onClose }: AddApiDialogProps) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !key.trim()) {
      return;
    }
    
    onAdd(name, key, description);
    setName("");
    setKey("");
    setDescription("");
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New API Integration</DialogTitle>
        <DialogDescription>
          Enter details for your custom API integration
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="api-name">API Name</Label>
          <Input 
            id="api-name" 
            placeholder="e.g., Ahrefs, SEMrush" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input 
            id="api-key"
            type="password"
            placeholder="Enter your API key" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-description">Description (optional)</Label>
          <Input 
            id="api-description"
            placeholder="What this API is used for" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAdd}>
          Add API
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

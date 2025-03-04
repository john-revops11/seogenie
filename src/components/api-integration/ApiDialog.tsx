
import { useState, useEffect } from "react";
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
import { Eye, EyeOff, Trash, AlertCircle } from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";

interface ApiDialogProps {
  api: ApiDetails;
  onUpdate: (updatedApi: ApiDetails) => void;
  onRemove: (apiId: string) => void;
  onClose: () => void;
}

export const ApiDialog = ({ 
  api, 
  onUpdate, 
  onRemove, 
  onClose 
}: ApiDialogProps) => {
  const [editedApi, setEditedApi] = useState<ApiDetails>({ ...api });
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const handleSave = () => {
    onUpdate(editedApi);
    onClose();
  };

  const handleRemove = () => {
    onRemove(api.id);
    onClose();
  };

  // Determine if this API needs special instructions
  const isDataForSEO = api.id === "dataforseo";

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit {api.name} API</DialogTitle>
        <DialogDescription>
          Update your API configuration
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="edit-api-key">
            {isDataForSEO ? "API Credentials" : "API Key"}
          </Label>
          
          {isDataForSEO && (
            <div className="flex items-start gap-2 mb-2 p-2 rounded bg-amber-50 text-amber-700 text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                For DataForSEO, enter your credentials in the format: <strong>username:password</strong><br />
                Example: youremail@example.com:your_password
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Input 
              id="edit-api-key"
              type={showApiKey ? "text" : "password"}
              placeholder={isDataForSEO ? "username:password" : "Enter your API key"} 
              value={editedApi.apiKey || ""}
              onChange={(e) => setEditedApi({
                ...editedApi,
                apiKey: e.target.value,
                isConfigured: e.target.value.trim() !== ""
              })}
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleApiVisibility}
            >
              {showApiKey ? 
                <EyeOff className="h-4 w-4" /> : 
                <Eye className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="api-active">Active</Label>
          <input 
            id="api-active"
            type="checkbox"
            className="rounded text-revology"
            checked={editedApi.isActive}
            onChange={(e) => setEditedApi({
              ...editedApi,
              isActive: e.target.checked
            })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          variant="destructive" 
          onClick={handleRemove}
          className="mr-auto"
        >
          <Trash className="h-4 w-4 mr-2" />
          Remove
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

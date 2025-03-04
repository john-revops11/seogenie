
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
}

export const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiName, setNewApiName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newApiType, setNewApiType] = useState("openai");

  const handleAddApiKey = () => {
    if (!newApiName.trim() || !newApiKey.trim()) {
      toast.error("Please provide both API name and key");
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiName.trim(),
      key: newApiKey.trim(),
      type: newApiType
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewApiName("");
    setNewApiKey("");
    toast.success(`Added new API key: ${newApiName}`);
  };

  const handleRemoveApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast.success("API key removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Name</Label>
            <Input
              value={newApiName}
              onChange={(e) => setNewApiName(e.target.value)}
              placeholder="e.g., OpenAI Production"
            />
          </div>
          
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter API key"
            />
          </div>

          <Button 
            onClick={handleAddApiKey}
            className="w-full"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </div>

        {apiKeys.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Saved API Keys</h3>
              <div className="space-y-2">
                {apiKeys.map((apiKey) => (
                  <div 
                    key={apiKey.id} 
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div>
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {apiKey.key.substring(0, 8)}...
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveApiKey(apiKey.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;

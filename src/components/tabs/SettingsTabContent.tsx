
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ApiIntegrationManager from "@/components/ApiIntegrationManager";

interface SettingsTabContentProps {
  showApiForm: boolean;
  newApiName: string;
  newApiKey: string;
  setShowApiForm: (show: boolean) => void;
  setNewApiName: (name: string) => void;
  setNewApiKey: (key: string) => void;
  handleAddNewApi: () => boolean;
}

export const SettingsTabContent = ({
  showApiForm,
  newApiName,
  newApiKey,
  setShowApiForm,
  setNewApiName,
  setNewApiKey,
  handleAddNewApi
}: SettingsTabContentProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [enableWebhook, setEnableWebhook] = useState(false);
  const [brandVoice, setBrandVoice] = useState("");
  
  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('revology-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWebhookUrl(settings.webhookUrl || "");
        setEnableWebhook(settings.enableWebhook || false);
        setBrandVoice(settings.brandVoice || "");
      } catch (error) {
        console.error("Error loading saved settings:", error);
      }
    }
  }, []);
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      webhookUrl,
      enableWebhook,
      brandVoice
    };
    
    localStorage.setItem('revology-settings', JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };
  
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-revology rounded-full flex items-center justify-center text-white font-bold">RA</div>
          <div>
            <CardTitle>Revology Analytics Settings</CardTitle>
            <CardDescription>Configure your analysis preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label htmlFor="api-key">API Key</Label>
          <Input id="api-key" type="password" value="b84198e677msh416f3b6bc96f2b3p1a60f3jsnaadb78e898c9" readOnly className="transition-all bg-muted/30" />
          <p className="text-sm text-muted-foreground">Used for keyword research and data retrieval</p>
        </div>
        
        <Separator />
        
        <ApiIntegrationManager />
        
        <Separator />
        
        <div className="space-y-3">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input 
            id="webhook-url" 
            placeholder="https://your-webhook-endpoint.com/seo-updates" 
            className="transition-all"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Receive notifications when analysis is complete</p>
          
          <div className="pt-2">
            <Label className="text-sm font-normal flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-revology"
                checked={enableWebhook}
                onChange={(e) => setEnableWebhook(e.target.checked)}
              />
              Enable webhook notifications
            </Label>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="brand-voice">Brand Voice</Label>
          <Textarea 
            id="brand-voice" 
            placeholder="Describe your brand's tone and voice for AI-generated content" 
            className="transition-all"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
          />
        </div>
        
        <Button 
          className="transition-all bg-revology hover:bg-revology-dark"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsTabContent;

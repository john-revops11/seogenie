
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
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
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  
  const toggleContentPreference = (preference: string) => {
    setContentPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      webhookUrl,
      enableWebhook,
      brandVoice,
      contentPreferences
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
        
        <div className="space-y-3">
          <Label>Content Preferences</Label>
          <div className="flex flex-wrap gap-2">
            {[
              "Include meta descriptions",
              "Focus on H1/H2 tags",
              "Use bullet points",
              "Add internal links"
            ].map(preference => {
              const id = preference.toLowerCase().replace(/\s+/g, '-');
              return (
                <Badge 
                  key={id}
                  variant={contentPreferences.includes(id) ? "default" : "outline"} 
                  className={`cursor-pointer ${
                    contentPreferences.includes(id) 
                      ? "bg-revology text-white" 
                      : "hover:bg-revology-light hover:text-revology hover:border-revology/30"
                  } transition-all`}
                  onClick={() => toggleContentPreference(id)}
                >
                  {preference}
                </Badge>
              );
            })}
          </div>
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

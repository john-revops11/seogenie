
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ApiIntegrationManager from "@/components/ApiIntegrationManager";

interface SettingsTabContentProps {
  showApiForm: boolean;
  newApiName: string;
  newApiKey: string;
  setShowApiForm: (show: boolean) => void;
  setNewApiName: (name: string) => void;
  setNewApiKey: (key: string) => void;
  handleAddNewApi: () => void;
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
          <Input id="webhook-url" placeholder="https://your-webhook-endpoint.com/seo-updates" className="transition-all" />
          <p className="text-sm text-muted-foreground">Receive notifications when analysis is complete</p>
          
          <div className="pt-2">
            <Label className="text-sm font-normal flex items-center gap-2">
              <input type="checkbox" className="rounded text-revology" />
              Enable webhook notifications
            </Label>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="brand-voice">Brand Voice</Label>
          <Textarea id="brand-voice" placeholder="Describe your brand's tone and voice for AI-generated content" className="transition-all" />
        </div>
        
        <div className="space-y-3">
          <Label>Content Preferences</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
              Include meta descriptions
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
              Focus on H1/H2 tags
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
              Use bullet points
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
              Add internal links
            </Badge>
          </div>
        </div>
        
        <Button className="transition-all bg-revology hover:bg-revology-dark">Save Settings</Button>
      </CardContent>
    </Card>
  );
};

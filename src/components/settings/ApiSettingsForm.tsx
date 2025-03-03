import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Zap, Database } from "lucide-react";
import { toast } from "sonner";
import { isPineconeConfigured, getPineconeConfig, configurePinecone } from "@/services/vector/config";

interface ApiSettingsFormProps {
  onAddNewApi: (apiName: string, apiKey: string) => void;
}

const ApiSettingsForm = ({ onAddNewApi }: ApiSettingsFormProps) => {
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [apiIntegrations, setApiIntegrations] = useState<any[]>([]);
  const [pineconeSettings, setPineconeSettings] = useState({
    isConfigured: false,
    apiKey: "",
    index: ""
  });

  useEffect(() => {
    try {
      const savedIntegrations = localStorage.getItem('apiIntegrations');
      if (savedIntegrations) {
        setApiIntegrations(JSON.parse(savedIntegrations));
      }
      
      const pineconeConfigured = isPineconeConfigured();
      const pineconeConfig = getPineconeConfig();
      
      setPineconeSettings({
        isConfigured: pineconeConfigured,
        apiKey: "",  // We don't display the full API key for security
        index: pineconeConfig.index
      });
    } catch (error) {
      console.error("Error loading API integrations:", error);
    }
  }, []);

  const handleAddNewApi = () => {
    if (!newApiName.trim() || !newApiKey.trim()) {
      toast.error("Please provide both API name and key");
      return;
    }
    
    const newIntegration = { 
      name: newApiName, 
      key: newApiKey.substring(0, 5) + '...'
    };
    
    const updatedIntegrations = [...apiIntegrations, newIntegration];
    setApiIntegrations(updatedIntegrations);
    
    localStorage.setItem('apiIntegrations', JSON.stringify(updatedIntegrations));
    
    onAddNewApi(newApiName, newApiKey);
    
    const apiEnabledStates = JSON.parse(localStorage.getItem('apiEnabledStates') || '{}');
    apiEnabledStates[newApiName.toLowerCase().replace(/\s+/g, '')] = true;
    localStorage.setItem('apiEnabledStates', JSON.stringify(apiEnabledStates));
    
    setNewApiName("");
    setNewApiKey("");
    setShowApiForm(false);
    
    toast.success(`${newApiName} API added successfully!`);
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
    
    localStorage.setItem('settingsSaved', 'true');
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
        
        <div className="space-y-3">
          <Label>API Integrations</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-dashed hover:border-revology/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">DataForSEO</h3>
                  <p className="text-xs text-muted-foreground">Keyword research API</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-dashed hover:border-revology/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-xs text-muted-foreground">AI content generation</p>
                </div>
              </div>
            </Card>
            
            {pineconeSettings.isConfigured && (
              <Card className="p-4 border-dashed hover:border-revology/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pinecone</h3>
                    <p className="text-xs text-muted-foreground">Vector database for RAG</p>
                    <p className="text-xs text-green-600 mt-1">Index: {pineconeSettings.index}</p>
                  </div>
                </div>
              </Card>
            )}
            
            {apiIntegrations.map((api, index) => (
              api.name !== "Pinecone" && (
                <Card key={index} className="p-4 border-dashed hover:border-revology/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Search className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{api.name}</h3>
                      <p className="text-xs text-muted-foreground">Custom API integration</p>
                      <p className="text-xs text-green-600 mt-1">Key: {api.key}</p>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
          
          {showApiForm ? (
            <div className="space-y-3 p-4 border rounded-lg border-revology/20 bg-muted/10 mt-4">
              <h3 className="font-medium">Add New API Integration</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-api-name">API Name</Label>
                  <Input 
                    id="new-api-name" 
                    placeholder="e.g., Ahrefs, SEMrush" 
                    value={newApiName}
                    onChange={(e) => setNewApiName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-api-key">API Key</Label>
                  <Input 
                    id="new-api-key" 
                    type="password"
                    placeholder="Enter your API key" 
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNewApi} className="bg-revology hover:bg-revology-dark">
                    Add API
                  </Button>
                  <Button variant="outline" onClick={() => setShowApiForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="mt-2 w-full"
              onClick={() => setShowApiForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New API Integration
            </Button>
          )}
        </div>
        
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

export default ApiSettingsForm;

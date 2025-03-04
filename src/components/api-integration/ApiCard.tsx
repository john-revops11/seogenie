import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Edit, Trash, Activity } from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";
import { ApiDialog } from "./ApiDialog";
import { icons } from "lucide-react";

interface ApiCardProps {
  api: ApiDetails;
  onUpdateApi: (updatedApi: ApiDetails) => void;
  onRemoveApi: (apiId: string) => void;
}

export const ApiCard = ({ 
  api, 
  onUpdateApi, 
  onRemoveApi 
}: ApiCardProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleApiVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const renderIcon = () => {
    if (api.icon) {
      return api.icon;
    }

    if (api.iconName) {
      const iconName = api.iconName
        .replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/-/g, '');

      const IconComponent = icons[iconName] || Activity;
      return <IconComponent className="h-5 w-5 text-gray-600" />;
    }

    return <Activity className="h-5 w-5 text-gray-600" />;
  };

  return (
    <Card key={api.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{api.name}</h3>
                {api.isConfigured && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Configured
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{api.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <ApiDialog 
                api={api}
                onUpdate={onUpdateApi}
                onRemove={onRemoveApi}
                onClose={() => setIsDialogOpen(false)}
              />
            </Dialog>
            
            {api.isConfigured ? (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemoveApi(api.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Configure
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </div>
        
        {api.isConfigured && api.apiKey && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">API Key: </span>
              <code className="text-xs bg-gray-100 p-1 rounded">
                {showApiKey ? api.apiKey : 
                  `${api.apiKey.substring(0, 5)}...${api.apiKey.substring(api.apiKey.length - 4)}`
                }
              </code>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0" 
              onClick={toggleApiVisibility}
            >
              {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

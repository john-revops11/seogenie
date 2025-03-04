
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ModelTestDialogProps } from "@/types/systemHealth";

export const ModelTestDialog: React.FC<ModelTestDialogProps> = ({
  open,
  onOpenChange,
  models = [],
  onTestModel,
  testModelStatus,
  testResponse
}) => {
  const [selectedModelToTest, setSelectedModelToTest] = useState<string>("");
  const [testPrompt, setTestPrompt] = useState<string>("Explain how keyword research works in 20 words or less.");

  const handleTestModel = async () => {
    if (!selectedModelToTest) return;
    await onTestModel(selectedModelToTest, testPrompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test AI Models</DialogTitle>
          <DialogDescription>
            Select an AI model to test its capabilities and response
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Model</label>
            <Select value={selectedModelToTest} onValueChange={setSelectedModelToTest}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        {model.capabilities[0]}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedModelToTest && !selectedModelToTest.includes("embedding") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Prompt</label>
              <textarea 
                className="w-full min-h-[80px] p-2 text-sm border rounded-md" 
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt for the model"
              />
            </div>
          )}
          
          <Button 
            onClick={handleTestModel} 
            className="w-full"
            disabled={testModelStatus === "loading"}
          >
            {testModelStatus === "loading" ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Test Model
              </>
            )}
          </Button>
          
          {testResponse && (
            <div className="mt-4 space-y-2">
              <Separator />
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Response:</h4>
                <div className={cn(
                  "p-3 text-sm rounded-md",
                  testModelStatus === "success" ? "bg-green-50" : "bg-red-50"
                )}>
                  {testResponse}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

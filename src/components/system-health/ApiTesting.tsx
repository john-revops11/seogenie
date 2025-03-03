
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, PlayCircle } from "lucide-react";
import { ApiTestingProps, API_DETAILS, AI_MODELS } from "./types";
import { renderTestResultIcon } from "./StatusIcons";

export const ApiTesting = ({ 
  apiStatus,
  selectedApiForTest, 
  setSelectedApiForTest, 
  testResult, 
  testApi,
  selectedModel,
  handleModelChange
}: ApiTestingProps) => {
  return (
    <div className="space-y-2 rounded-md bg-gray-50 dark:bg-gray-800 p-3">
      <h4 className="text-xs font-semibold mb-2">API Testing</h4>
      <div className="flex items-center gap-2 mb-2">
        <Select value={selectedApiForTest} onValueChange={setSelectedApiForTest}>
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select API to test" />
          </SelectTrigger>
          <SelectContent>
            {API_DETAILS.map((api) => (
              <SelectItem key={api.id} value={api.id} className="text-xs">
                {api.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          size="xs" 
          onClick={() => testApi(selectedApiForTest)}
          disabled={testResult.status === "loading"}
          className="h-8"
        >
          {testResult.status === "loading" ? (
            <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <PlayCircle className="h-3 w-3 mr-1" />
          )}
          Test
        </Button>
      </div>
      
      {selectedApiForTest === "openai" && (
        <div className="mb-2">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {AI_MODELS.find(m => m.id === selectedModel)?.description}
          </p>
        </div>
      )}
      
      {testResult.status !== "idle" && (
        <div className={`text-xs p-2 rounded flex items-start gap-1.5 ${
          testResult.status === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : 
          testResult.status === "error" ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" : 
          "bg-gray-100 dark:bg-gray-700"
        }`}>
          {renderTestResultIcon(testResult.status)}
          <span className="flex-1">{testResult.message}</span>
        </div>
      )}
    </div>
  );
};

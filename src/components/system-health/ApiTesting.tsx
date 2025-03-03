
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
      
      {selectedApiForTest === "pinecone" && apiStatus.pinecone?.status === "error" && (
        <div className="mb-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          <p className="font-semibold">Troubleshooting Pinecone</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Verify your API key format</li>
            <li>Check if your index name is correct</li>
            <li>Your browser may have CORS restrictions</li>
            <li>Make sure your Pinecone plan is active</li>
          </ul>
        </div>
      )}
      
      {selectedApiForTest === "googleAds" && !apiStatus.googleAds?.enabled && (
        <div className="mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          <p>Google Ads API is configured with:</p>
          <ul className="list-disc pl-4 mt-1">
            <li>Client ID: ...8hs</li>
            <li>API Key: ...Ey4</li>
          </ul>
          <p className="mt-1">To use it, enable the API using the toggle.</p>
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

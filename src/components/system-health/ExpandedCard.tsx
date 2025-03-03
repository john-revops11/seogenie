
import { Button } from "@/components/ui/button";
import { Cog, PlayCircle, X } from "lucide-react";
import { ApiList } from "./ApiList";
import { ApiTesting } from "./ApiTesting";
import { renderHealthIcon } from "./StatusIcons";
import { ApiStatusState, TestResultState } from "./types";
import { calculateOverallHealth } from "./utils";

interface ExpandedCardProps {
  apiStatus: ApiStatusState;
  checking: boolean;
  showTesting: boolean;
  setShowTesting: React.Dispatch<React.SetStateAction<boolean>>;
  checkApiHealth: () => Promise<void>;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  selectedApiForTest: string;
  setSelectedApiForTest: React.Dispatch<React.SetStateAction<string>>;
  testResult: TestResultState;
  testApi: (apiId: string) => Promise<void>;
  toggleApiEnabled: (apiId: string) => void;
  selectedModel: string;
  handleModelChange: (value: string) => void;
}

export const ExpandedCard = ({
  apiStatus,
  checking,
  showTesting,
  setShowTesting,
  checkApiHealth,
  setExpanded,
  selectedApiForTest,
  setSelectedApiForTest,
  testResult,
  testApi,
  toggleApiEnabled,
  selectedModel,
  handleModelChange
}: ExpandedCardProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          {renderHealthIcon(calculateOverallHealth(apiStatus))}
          System Health
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setShowTesting(!showTesting)}
            title="Test APIs"
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => checkApiHealth()}
            disabled={checking}
          >
            <Cog className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showTesting && (
        <ApiTesting 
          apiStatus={apiStatus}
          selectedApiForTest={selectedApiForTest}
          setSelectedApiForTest={setSelectedApiForTest}
          testResult={testResult}
          testApi={testApi}
          selectedModel={selectedModel}
          handleModelChange={handleModelChange}
        />
      )}
      
      <ApiList 
        apiStatus={apiStatus} 
        toggleApiEnabled={toggleApiEnabled} 
      />
    </div>
  );
};

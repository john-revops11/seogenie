
import { ApiStates } from "@/types/systemHealth";
import { ApiCardDetail } from "./ApiCardDetail";

interface SystemHealthGridProps {
  apiStates: ApiStates;
  expanded: boolean;
  onRetry: (api: keyof ApiStates) => void;
  onTestModels: (provider: "openai" | "gemini") => void;
  onOpenDocs: (api: keyof ApiStates) => void;
}

export const SystemHealthGrid = ({
  apiStates,
  expanded,
  onRetry,
  onTestModels,
  onOpenDocs
}: SystemHealthGridProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(apiStates).map(([apiKey, apiState]) => {
        const api = apiKey as keyof ApiStates;
        return (
          <div key={apiKey} className="flex-1 min-w-[150px]">
            <ApiCardDetail 
              api={api}
              state={apiState}
              expanded={expanded}
              onRetry={onRetry}
              onTestModels={
                api === "openai" ? () => onTestModels("openai") : 
                api === "gemini" ? () => onTestModels("gemini") : 
                undefined
              }
              onOpenDocs={api !== "googleAds" && api !== "rapidApi" ? () => onOpenDocs(api) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

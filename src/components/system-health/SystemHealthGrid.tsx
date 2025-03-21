
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
  // Filter to only show essential APIs
  const essentialApis = ["openai", "gemini", "pinecone", "dataForSeo"];
  
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {Object.entries(apiStates)
        .filter(([apiKey]) => essentialApis.includes(apiKey))
        .map(([apiKey, apiState]) => {
          const api = apiKey as keyof ApiStates;
          return (
            <div key={apiKey} className="flex-1 min-w-[220px] max-w-[350px]">
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

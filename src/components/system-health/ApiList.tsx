
import { API_DETAILS } from "./types";
import { renderStatusIcon } from "./StatusIcons";
import { ApiToggle } from "./ApiToggle";
import { ApiStatusBadge } from "./ApiStatusBadge";
import { ApiStatusState } from "./types";

interface ApiListProps {
  apiStatus: ApiStatusState;
  toggleApiEnabled: (apiId: string) => void;
}

export const ApiList = ({ apiStatus, toggleApiEnabled }: ApiListProps) => {
  return (
    <div className="space-y-2">
      {API_DETAILS.map((api) => (
        <div key={api.id} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {renderStatusIcon(apiStatus[api.id]?.status || "checking", api.id)}
            <span>{api.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ApiToggle 
              apiId={api.id} 
              apiStatus={apiStatus} 
              toggleApiEnabled={toggleApiEnabled}
            />
            <ApiStatusBadge 
              apiId={api.id} 
              apiStatus={{
                ...apiStatus,
                [api.id]: {
                  ...apiStatus[api.id],
                  description: api.description
                }
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

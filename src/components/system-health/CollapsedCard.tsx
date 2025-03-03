
import { calculateOverallHealth } from "./utils";
import { renderHealthIcon } from "./StatusIcons";
import { ApiStatusState } from "./types";

interface CollapsedCardProps {
  apiStatus: ApiStatusState;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CollapsedCard = ({ apiStatus, setExpanded }: CollapsedCardProps) => {
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer" 
      onClick={() => setExpanded(true)}
    >
      {renderHealthIcon(calculateOverallHealth(apiStatus))}
      <span className="text-sm font-medium">System Health</span>
    </div>
  );
};

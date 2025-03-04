
import { Loader2 } from "lucide-react";

export function KeywordGapLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default KeywordGapLoader;

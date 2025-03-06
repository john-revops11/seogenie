
import { toast } from "sonner";

export function useKeywordActions(
  setSelectedKeywords: (keywords: string[]) => void
) {
  // Generate from a keyword directly
  const handleGenerateFromKeyword = (keyword: string) => {
    if (keyword) {
      setSelectedKeywords([keyword]);
      toast.info(`Selected keyword: ${keyword}`);
    }
  };

  return {
    handleGenerateFromKeyword
  };
}

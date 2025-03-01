
// Import the KeywordGap type from the keywordService file
import { KeywordGap } from "@/services/keywordService";

// Create a cache to store keyword gaps
export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0
};

// Need to add a default export for the component since it's imported as default in Index.tsx
export default function KeywordGapCard(props: any) {
  // This is a placeholder - the actual component code will be implemented elsewhere
  // but we need to provide a default export
  return null;
}

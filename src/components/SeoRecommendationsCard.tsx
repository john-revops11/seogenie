
// Import the SeoRecommendation type from the keywordService file
import { SeoRecommendation } from "@/services/keywordService";

// Create a cache to store recommendations
export const recommendationsCache = {
  data: null as {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null,
  domain: "",
  keywordsLength: 0
};

// Need to add a default export for the component since it's imported as default in Index.tsx
export default function SeoRecommendationsCard(props: any) {
  // This is a placeholder - the actual component code will be implemented elsewhere
  // but we need to provide a default export
  return null;
}

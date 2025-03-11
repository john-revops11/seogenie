
import { useState } from "react";
import { ContentTemplate } from "@/services/keywords/types";

// Default templates for different content types
const DEFAULT_TEMPLATES: ContentTemplate[] = [
  {
    id: "standard-blog",
    name: "Standard Blog Post",
    contentType: "blog-post",
    structure: ["introduction", "main-points", "conclusion"],
    description: "A classic blog post structure with introduction, body, and conclusion."
  },
  {
    id: "how-to-guide",
    name: "How-To Guide",
    contentType: "blog-post",
    structure: ["introduction", "materials", "step-by-step", "conclusion"],
    description: "Step-by-step instructions to accomplish a specific task."
  },
  {
    id: "list-post",
    name: "List Article",
    contentType: "blog-post",
    structure: ["introduction", "numbered-list", "conclusion"],
    description: "A list-based article format that's easy to scan and digest."
  },
  {
    id: "product-page",
    name: "Product Description",
    contentType: "product-page",
    structure: ["overview", "benefits", "features", "specs", "cta"],
    description: "Detailed product description highlighting features and benefits."
  },
  {
    id: "landing-page",
    name: "Landing Page",
    contentType: "landing-page",
    structure: ["headline", "problem", "solution", "testimonials", "cta"],
    description: "High-converting landing page template with clear call-to-action."
  }
];

export function useContentTemplates() {
  const [templates] = useState<ContentTemplate[]>(DEFAULT_TEMPLATES);
  
  const getTemplatesForType = (contentType: string) => {
    return templates.filter(template => template.contentType === contentType);
  };
  
  return {
    templates,
    getTemplatesForType
  };
}

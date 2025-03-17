
import { toast } from "sonner";
import { ContentOutline, GeneratedContent } from "@/services/keywords/types";
import { 
  parseContentToBlocks, 
  formatBlocksToHtml 
} from "@/services/keywords/generation/contentBlockService";
import { AIProvider } from "@/types/aiModels";

interface GenerateContentParams {
  domain: string;
  keywords: string[];
  contentType: string;
  title: string;
  creativity: number;
  contentPreferences: string[];
  templateId: string;
  aiProvider: AIProvider;
  aiModel: string;
  ragEnabled: boolean;
  wordCountOption: string;
  customSubheadings?: string[];
}

export const generateContent = async (params: GenerateContentParams): Promise<{
  content: string;
  generatedContent: GeneratedContent;
}> => {
  const {
    domain,
    keywords,
    contentType,
    title,
    creativity,
    contentPreferences,
    templateId,
    aiProvider,
    aiModel,
    ragEnabled,
    wordCountOption,
    customSubheadings
  } = params;

  if (!title) {
    throw new Error("Title is required");
  }

  if (keywords.length === 0) {
    throw new Error("At least one keyword is required");
  }

  try {
    // For simplicity in this demo, we'll generate placeholder content
    // In a real application, you would call your AI service here

    const outlineHeadings = customSubheadings || [
      "Introduction",
      "What is " + title,
      "Key Benefits",
      "How to Implement",
      "Best Practices",
      "Conclusion"
    ];

    // Generate some placeholder content based on the title and keywords
    const paragraphs = [
      `<h1>${title}</h1>`,
      `<p>This article explores ${title} in detail, with a focus on ${keywords.join(", ")}.</p>`,
      `<h2>Introduction</h2>`,
      `<p>Understanding ${title} is crucial for success in today's competitive landscape. This comprehensive guide will walk you through everything you need to know.</p>`,
      `<h2>What is ${title}?</h2>`,
      `<p>${title} refers to a strategic approach for optimizing performance in various contexts. The concept has gained significant traction in recent years.</p>`,
      `<h2>Key Benefits</h2>`,
      `<ul>
        <li>Improved efficiency and productivity</li>
        <li>Enhanced strategic positioning</li>
        <li>Better resource allocation</li>
        <li>Competitive advantage in the marketplace</li>
      </ul>`,
      `<h2>How to Implement</h2>`,
      `<p>Implementing ${title} requires a thoughtful approach and careful planning. Begin by assessing your current situation and identifying areas for improvement.</p>`,
      `<ol>
        <li>Conduct a thorough analysis</li>
        <li>Develop a strategic plan</li>
        <li>Allocate necessary resources</li>
        <li>Measure results and iterate</li>
      </ol>`,
      `<h2>Best Practices</h2>`,
      `<p>To maximize the impact of ${title}, consider these best practices that industry leaders have successfully implemented.</p>`,
      `<blockquote>The key to success with ${title} is consistency and continuous improvement.</blockquote>`,
      `<h2>Conclusion</h2>`,
      `<p>By leveraging ${title} effectively, organizations can achieve significant improvements in performance and strategic positioning.</p>`
    ];

    const htmlContent = paragraphs.join("\n");
    
    // Parse the content into blocks
    const contentBlocks = parseContentToBlocks(htmlContent);
    
    // Create the final generated content object
    const generatedContent: GeneratedContent = {
      title,
      metaDescription: `A comprehensive guide to ${title}, focusing on ${keywords.slice(0, 3).join(", ")}.`,
      outline: outlineHeadings,
      content: htmlContent,
      blocks: contentBlocks,
      keywords,
      contentType,
      generationMethod: ragEnabled ? 'rag' : 'standard',
      aiProvider,
      aiModel,
      wordCountOption
    };

    return {
      content: htmlContent,
      generatedContent
    };
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
};

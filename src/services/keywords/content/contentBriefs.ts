
import { ContentType } from './contentTypes';

/**
 * Creates a content brief based on the type of content, title, and domain
 */
export const createContentBrief = (
  contentType: ContentType, 
  title: string, 
  domain: string
): string => {
  switch (contentType) {
    case "blog":
      return `Create a comprehensive blog post optimized for SEO that educates business professionals about ${title}. 
      Use a professional and informative tone. Include data points, statistics, and real-world examples.
      Structure with clear headings (H1, H2, H3), bullet points for clarity, short paragraphs, and conclude with actionable next steps.
      Format: 
      - Engaging introduction that hooks the reader and clearly states why this topic matters
      - Key sections with subheadings that explain concepts and provide examples
      - Strategic use of bold text to emphasize important points
      - Conclusion summarizing key takeaways with a clear call to action`;
      
    case "case-study":
      return `Create a business case study about ${title} that follows this exact structure:

      <h1>[Title] Case Study: [Solution] at [Company/Project]</h1>
      
      <h2>Industry: [Industry] | Area: [Specific Area or Focus]</h2>
      
      <p>In collaboration with [Partner], Revology's strategic partner for [value proposition].</p>
      
      <div class="case-study-section">
        <div class="left-column">
          <h3>Fragmented Client Background</h3>
          <p>[Describe the client's structure and challenges in 3-4 sentences]</p>
        </div>
        
        <div class="right-column">
          <h3>Business Structure</h3>
          <p>[Describe the business organization and growth in 3-4 sentences]</p>
        </div>
      </div>
      
      <h3>Crowded Market Challenges</h3>
      <p>[Describe market competition, risks, and positioning in 3-4 sentences]</p>
      
      <h3>Legacy Platform Issues</h3>
      <p>[Describe technical/platform challenges in 4-6 sentences]</p>
      
      <h2>Situation:</h2>
      
      <div class="case-study-grid">
        <div class="grid-item">
          <h3>[Challenge 1]</h3>
          <p>[Details about challenge 1 in 3-4 sentences]</p>
        </div>
        
        <div class="grid-item">
          <h3>[Challenge 2]</h3>
          <p>[Details about challenge 2 in 3-4 sentences]</p>
        </div>
        
        <div class="grid-item">
          <h3>[Challenge 3]</h3>
          <p>[Details about challenge 3 in 3-4 sentences]</p>
        </div>
        
        <div class="grid-item">
          <h3>[Challenge 4]</h3>
          <p>[Details about challenge 4 in 3-4 sentences]</p>
        </div>
      </div>
      
      <h2>Obstacles</h2>
      <p>[Describe key obstacles in 3-5 sentences]</p>
      
      <h2>Action</h2>
      <p>Revology Analytics was engaged by the client's C-suite to provide a comprehensive solution for [primary challenge] in preparation for [goal/milestone].</p>
      
      <p>The project involved several key steps:</p>
      
      <div class="numbered-section">
        <h3>1. [Action Area 1]</h3>
        <p>[Describe action area 1 in 4-6 sentences]</p>
      </div>
      
      <div class="numbered-section">
        <h3>2. [Action Area 2]</h3>
        <p>[Describe action area 2 in 4-6 sentences]</p>
      </div>
      
      <div class="numbered-section">
        <h3>3. [Action Area 3]</h3>
        <p>[Describe action area 3 in 4-6 sentences]</p>
      </div>
      
      <div class="numbered-section">
        <h3>4. [Action Area 4]</h3>
        <p>[Describe action area 4 in 4-6 sentences]</p>
      </div>
      
      <h2>Results</h2>
      
      <div class="results-section">
        <h3>Revenue Growth and Margin Expansion</h3>
        <p>[Describe revenue outcomes in 4-6 sentences with specific metrics]</p>
      </div>
      
      <div class="results-section">
        <h3>Strategic Market Penetration</h3>
        <p>[Describe market penetration outcomes in 4-6 sentences with specific metrics]</p>
      </div>
      
      <div class="results-section">
        <h3>Enhanced [Area of Improvement]</h3>
        <p>[Describe specific improvement outcomes in 4-6 sentences]</p>
      </div>
      
      <div class="results-section">
        <h3>Ongoing Partnership and [Focus Area]</h3>
        <p>[Describe partnership outcomes and future focus in 4-6 sentences]</p>
      </div>
      
      Please follow this example format for the Case Study:
      
      Case Study SaaS: Portfolio Pricing Optimization at New Platform Launch
      Industry: SaaS | Area: Pricing and Revenue Growth Management
      In collaboration with EBITDA Catalyst, Revology's strategic partner for driving value creation for mid-market Private Equity.
      
      Fragmented Client Background
      The client, a mid-sized Private-Equity held SaaS solution provider, experienced rapid growth through organic expansion and a series of strategic add-on acquisitions. Each business unit developed its own pricing strategy, resulting in a lack of uniformity and inefficiencies across the organization. This fragmentation made it challenging to maintain consistent pricing practices and optimize revenue effectively.
      
      Business Structure
      This expansion led to a complex business structure with multiple independently operated business units.
      
      Crowded Market Challenges
      The client faced a crowded market where competitors aggressively vied for market share based on features and value. Despite benefiting from secular growth trends, the company faced significant risks of engaging in a "race to the bottom" in pricing, which would have eroded margins if not managed carefully.
      
      Legacy Platform Issues
      The client was preparing to launch a new flagship platform to consolidate its legacy software solutions, which had become a costly drain on resources. The existing structure had inefficiencies, such as inconsistent customer transaction recording and an over-reliance on Excel for analytics, which limited the company's ability to monitor and optimize pricing effectively.`;
      
    case "white-paper":
      return `Create an executive-level white paper about ${title} for business decision-makers.
      Structure:
      - Header/Subtitle introducing the topic
      - Compelling title
      - Table of contents (formatted as a list)
      - Executive Summary: Brief overview of the white paper's purpose and key findings
      - Introduction: Context about industry trends and challenges
      - Core sections with subheadings covering key aspects of the topic
      - Implementation or strategy roadmap
      - Conclusion with key insights and next steps
      - About section (optional)
      Use a comprehensive, data-driven approach with formal tone suitable for senior professionals.
      Include statistics, industry references, and well-structured paragraphs and bullet points.`;
      
    case "guide":
      return `Create a comprehensive guide about ${title} that serves as an authoritative resource.
      Format with detailed step-by-step instructions, expert insights, and practical applications.
      Include introduction explaining the importance of the topic, detailed sections covering all aspects,
      and a conclusion with implementation recommendations. Use a professional, educational tone with
      clear headings, bullet points, and numbered lists where appropriate.`;
      
    case "article":
      return `Create an in-depth article about ${title} that provides analysis and insights.
      Structure with an engaging introduction, well-researched body sections exploring different angles of the topic,
      expert perspectives or quotes where relevant, and a conclusion that synthesizes the key points.
      Use a professional, journalistic tone with clear headings and concise paragraphs.`;
      
    default:
      return `Create informative and engaging content about ${title} for a business audience.
      Balance educational value with readability, and organize with clear structure using proper HTML headings (H1, H2, H3).`;
  }
};

/**
 * Add content preferences to the brief
 */
export const addContentPreferencesToBrief = (
  brief: string, 
  contentPreferences: string[]
): string => {
  if (!contentPreferences || contentPreferences.length === 0) {
    return brief;
  }
  
  let updatedBrief = brief + `\n\nPlease incorporate the following content preferences: ${contentPreferences.join(', ')}.`;
  
  // Add specific instructions for each preference
  if (contentPreferences.includes('Focus on H1/H2 tags')) {
    updatedBrief += `\nEnsure proper heading hierarchy with a clear H1 title and logical H2 sections.`;
  }
  if (contentPreferences.includes('Include meta descriptions')) {
    updatedBrief += `\nCreate a compelling meta description that includes primary keywords.`;
  }
  if (contentPreferences.includes('Use bullet points')) {
    updatedBrief += `\nUtilize bullet points to break down complex information and improve readability.`;
  }
  if (contentPreferences.includes('Add internal links')) {
    updatedBrief += `\nSuggest potential internal linking opportunities within the content.`;
  }
  // Add new preferences handling
  if (contentPreferences.includes('Add tables for data')) {
    updatedBrief += `\nInclude HTML tables to present data in a structured format where appropriate.`;
  }
  if (contentPreferences.includes('Include statistics')) {
    updatedBrief += `\nIncorporate relevant industry statistics and data points to support key claims.`;
  }
  if (contentPreferences.includes('Add FAQ section')) {
    updatedBrief += `\nAdd a FAQ section at the end addressing common questions related to the topic.`;
  }
  
  return updatedBrief;
};

/**
 * Add RAG-enhanced context to the content brief
 */
export const addRagContextToBrief = (
  brief: string, 
  ragResults: any, 
  ragEnabled: boolean
): string => {
  if (!ragEnabled || !ragResults) {
    return brief;
  }
  
  let updatedBrief = brief;
  
  if (ragResults.relatedTopics && ragResults.relatedTopics.length > 0) {
    updatedBrief += `\n\nConsider including these related topics: ${ragResults.relatedTopics.join(', ')}.`;
  }
  
  if (ragResults.contextualExamples && ragResults.contextualExamples.length > 0) {
    updatedBrief += `\n\nReference these contextual examples where appropriate:`;
    ragResults.contextualExamples.forEach((example: string) => {
      updatedBrief += `\n- "${example}"`;
    });
  }
  
  if (ragResults.structuralRecommendations && ragResults.structuralRecommendations.length > 0) {
    updatedBrief += `\n\nFollow these structural recommendations:`;
    ragResults.structuralRecommendations.forEach((rec: string) => {
      updatedBrief += `\n- ${rec}`;
    });
  }
  
  return updatedBrief;
};

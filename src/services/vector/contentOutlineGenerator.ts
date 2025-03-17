
import { ContentOutline } from '../keywords/types';

/**
 * Generates content outlines based on a title and keywords
 */
export const generateContentOutline = async (
  title: string,
  keywords: string[],
  contentType: string,
  regenerationCount: number = 0,
  customPrompt?: string
): Promise<ContentOutline> => {
  console.log(`Generating outline for: ${title}, regeneration #${regenerationCount}`);
  
  // If we have a custom prompt, use it to influence the headings
  if (customPrompt) {
    console.log("Using custom prompt for heading generation");
    // This would normally call an AI service with the custom prompt
    // For now, we'll create a more dynamic version of headings
    
    // Create variations based on the prompt and regeneration count
    const headingVariations = [
      [
        "Introduction to the Challenge",
        "Current Industry Landscape",
        "The Problem: Identifying Key Challenges",
        `Why ${title} Matters in Today's Market`,
        "The Process: Revology Analytics' Methodology",
        `Strategic Approach to ${keywords[0] || title}`,
        "Implementation Framework and Timeline",
        "The Payoff: Measurable Results",
        "ROI and Performance Metrics",
        "Case Study: Success in Action",
        "Next Steps for Implementation",
        "Conclusion: The Path Forward"
      ],
      [
        "The Evolution of Industry Challenges",
        `Understanding ${title}: A Deep Dive`,
        "Critical Pain Points in Modern Business",
        "Market Analysis and Opportunity Landscape",
        "Revology's Innovative Approach",
        "The Four-Step Implementation Process",
        "Technology Integration and Execution",
        "Transformation Outcomes and Benefits",
        "Measuring Success: KPIs and Metrics",
        "Client Testimonials and Proof Points",
        "Strategic Recommendations",
        "Conclusion: Partnering for Success"
      ],
      [
        "Market Overview and Current Challenges",
        `The ${title} Dilemma: Understanding the Problem`,
        "Competitive Analysis and Gap Identification",
        "Risk Assessment in Today's Landscape",
        "Revology's Data-Driven Methodology",
        "Technical Implementation Framework",
        "Resource Allocation and Timeline",
        "Tangible Business Outcomes",
        "Financial Impact Analysis",
        "Long-term Sustainability of Results",
        "Action Plan and Next Steps",
        "Summary and Strategic Recommendations"
      ]
    ];
    
    // Use some words from the custom prompt to create variation
    const promptWords = customPrompt.split(' ')
      .filter(word => word.length > 4)
      .map(word => word.trim())
      .filter(Boolean);
    
    // Create heading variations based on regeneration count and custom prompt
    const variationIndex = regenerationCount % headingVariations.length;
    const baseHeadings = headingVariations[variationIndex];
    
    // Customize some headings based on prompt words if available
    const customizedHeadings = baseHeadings.map((heading, index) => {
      if (promptWords.length > 0 && index % 3 === 0) {
        const wordIndex = (index + regenerationCount) % promptWords.length;
        const promptWord = promptWords[wordIndex];
        if (promptWord && promptWord.length > 0) {
          return heading.includes(':') 
            ? heading.split(':')[0] + `: ${promptWord.charAt(0).toUpperCase() + promptWord.slice(1)} Strategies`
            : `${heading} for ${promptWord.charAt(0).toUpperCase() + promptWord.slice(1)} Excellence`;
        }
      }
      return heading;
    });
    
    return {
      title,
      headings: customizedHeadings,
      faqs: [
        {
          question: `What are the biggest challenges in ${title}?`,
          answer: "This will be generated with AI"
        },
        {
          question: `How does Revology Analytics approach ${title.split(' ').slice(0, 3).join(' ')}?`,
          answer: "This will be generated with AI"
        },
        {
          question: `What ROI can businesses expect from implementing solutions for ${title.split(' ').slice(0, 4).join(' ')}?`,
          answer: "This will be generated with AI"
        }
      ]
    };
  }
  
  // Standard heading variations to use when regenerating
  const headingsVariations = [
    // Variation 1 - Standard Revology framework
    [
      "Introduction",
      // Problem section
      "The Problem",
      `Challenges in ${title.split(' ').slice(0, 3).join(' ')}`,
      "Industry Pain Points",
      // Process section
      "The Process",
      `Revology Analytics' Approach to ${title.split(' ').slice(0, 3).join(' ')}`,
      "Methodology and Implementation",
      // Payoff section
      "The Payoff",
      "Results and Benefits",
      "Success Stories and Case Studies",
      // Proposition section
      "Next Steps",
      "Conclusion"
    ],
    // Variation 2 - More technical focus
    [
      "Introduction and Market Overview",
      "Critical Business Challenges",
      `Technical Obstacles in ${title.split(' ').slice(0, 3).join(' ')}`,
      "Data Integration Pain Points",
      "Revology's Technical Framework",
      "Implementation Methodology",
      "System Architecture and Integration",
      "Measurable Outcomes",
      "Performance Metrics and KPIs",
      "ROI Analysis",
      "Implementation Roadmap",
      "Strategic Recommendations"
    ],
    // Variation 3 - More strategic focus
    [
      "Executive Summary",
      "Strategic Business Challenges",
      "Competitive Landscape Analysis",
      "Market Opportunity Assessment",
      "Revology's Strategic Approach",
      "Business Transformation Process",
      "Change Management Framework",
      "Strategic Advantages",
      "Long-term Business Impact",
      "Organizational Growth Metrics",
      "Partnership Strategy",
      "Future-Proofing Your Business"
    ],
    // Variation 4 - More customer-focused
    [
      "The Customer Experience Challenge",
      "User Pain Points and Feedback",
      "Voice of Customer Analysis",
      "Service Delivery Gaps",
      "Revology's Customer-Centric Approach",
      "Experience Transformation Process",
      "Customer Journey Optimization",
      "Customer Satisfaction Improvements",
      "Loyalty and Retention Metrics",
      "Customer Success Stories",
      "Building Long-term Relationships",
      "From Customers to Advocates"
    ]
  ];
  
  // Select variation based on regeneration count
  const variationIndex = regenerationCount % headingsVariations.length;
  const headings = headingsVariations[variationIndex];
  
  // Create FAQ variations
  const faqVariations = [
    [
      {
        question: `What are the biggest challenges in ${title}?`,
        answer: "This will be generated with AI"
      },
      {
        question: `How does Revology Analytics approach ${title.split(' ').slice(0, 3).join(' ')}?`,
        answer: "This will be generated with AI"
      },
      {
        question: `What ROI can businesses expect from implementing solutions for ${title.split(' ').slice(0, 4).join(' ')}?`,
        answer: "This will be generated with AI"
      }
    ],
    [
      {
        question: `What makes ${title} particularly challenging for businesses today?`,
        answer: "This will be generated with AI"
      },
      {
        question: `What differentiates Revology Analytics' methodology for ${keywords[0] || title}?`,
        answer: "This will be generated with AI"
      },
      {
        question: `How quickly can companies expect to see results after implementing these solutions?`,
        answer: "This will be generated with AI"
      }
    ],
    [
      {
        question: `How does ${title} impact overall business performance?`,
        answer: "This will be generated with AI"
      },
      {
        question: `What industries benefit most from Revology's approach to ${keywords[0] || title}?`,
        answer: "This will be generated with AI"
      },
      {
        question: `What metrics should companies track when implementing solutions for ${title}?`,
        answer: "This will be generated with AI"
      }
    ],
    [
      {
        question: `What are the costs of ignoring ${title} challenges in today's market?`,
        answer: "This will be generated with AI"
      },
      {
        question: `How scalable is Revology Analytics' solution for ${keywords[0] || title}?`,
        answer: "This will be generated with AI"
      },
      {
        question: `What case studies demonstrate successful implementation of these strategies?`,
        answer: "This will be generated with AI"
      }
    ]
  ];
  
  const faqIndex = regenerationCount % faqVariations.length;
  
  return {
    title,
    headings,
    faqs: faqVariations[faqIndex]
  };
};

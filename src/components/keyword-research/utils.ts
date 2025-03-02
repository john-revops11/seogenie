
import { ResearchKeyword } from './types';

export const getSampleKeywords = (searchTerm: string): ResearchKeyword[] => {
  const baseKeywords = [
    {
      keyword: `${searchTerm} analytics`,
      volume: Math.floor(Math.random() * 5000) + 500,
      difficulty: Math.floor(Math.random() * 70) + 20,
      cpc: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      recommendation: "Create a dedicated landing page focusing on analytics solutions",
      relatedKeywords: ["data analytics", "business analytics", "analytics dashboard", "metrics tracking"]
    },
    {
      keyword: `${searchTerm} software`,
      volume: Math.floor(Math.random() * 8000) + 1000,
      difficulty: Math.floor(Math.random() * 60) + 30,
      cpc: parseFloat((Math.random() * 8 + 2).toFixed(2)),
      recommendation: "Develop a product comparison page highlighting software benefits",
      relatedKeywords: ["SaaS platforms", "business software", "software solutions", "cloud software"]
    },
    {
      keyword: `${searchTerm} management`,
      volume: Math.floor(Math.random() * 6000) + 800,
      difficulty: Math.floor(Math.random() * 50) + 20,
      cpc: parseFloat((Math.random() * 6 + 1.5).toFixed(2)),
      recommendation: "Write detailed guides on management best practices",
      relatedKeywords: ["management strategies", "team management", "performance management"]
    },
    {
      keyword: `best ${searchTerm} tools`,
      volume: Math.floor(Math.random() * 4000) + 600,
      difficulty: Math.floor(Math.random() * 40) + 10,
      cpc: parseFloat((Math.random() * 4 + 0.8).toFixed(2)),
      recommendation: "Create a listicle comparing the top tools in the industry",
      relatedKeywords: ["top tools", "recommended tools", "tool comparison", "productivity tools"]
    },
    {
      keyword: `${searchTerm} examples`,
      volume: Math.floor(Math.random() * 3000) + 400,
      difficulty: Math.floor(Math.random() * 30) + 10,
      cpc: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      recommendation: "Showcase real-world examples and case studies",
      relatedKeywords: ["case studies", "success stories", "implementation examples"]
    },
    {
      keyword: `${searchTerm} strategies`,
      volume: Math.floor(Math.random() * 3500) + 450,
      difficulty: Math.floor(Math.random() * 45) + 15,
      cpc: parseFloat((Math.random() * 4 + 1.2).toFixed(2)),
      recommendation: "Develop long-form content on strategic approaches",
      relatedKeywords: ["growth strategies", "optimization strategies", "strategic planning"]
    }
  ];
  
  return baseKeywords.slice(0, Math.floor(Math.random() * 3) + 4);
};

export const getDifficultyColor = (difficulty: number) => {
  if (difficulty < 30) return "bg-green-100 text-green-800";
  if (difficulty < 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

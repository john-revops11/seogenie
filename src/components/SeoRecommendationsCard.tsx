
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, Lightbulb } from "lucide-react";

const generateSeoRecommendations = (domain: string) => {
  const onPageRecommendations = [
    "Add primary keyword 'seo tools' to your H1 tag on the homepage",
    "Include keyword 'keyword research' in first paragraph of content",
    "Add more descriptive alt text to images on product pages",
    "Increase content length on your blog post about 'backlink checker'",
    "Create dedicated landing pages for high-volume keywords",
    "Improve meta descriptions on 5 key pages to increase CTR",
    "Add internal links to your 'seo analysis' page from other related pages"
  ];
  
  const technicalRecommendations = [
    "Improve page load speed on mobile devices (currently 3.2s, aim for under 2s)",
    "Fix 4 broken links found on the blog section",
    "Implement proper heading structure (H1, H2, H3) consistently",
    "Add structured data markup for your service pages",
    "Ensure all pages are mobile-friendly",
    "Fix 2 duplicate title tags found on blog category pages",
    "Implement proper canonical tags across the website"
  ];
  
  const contentRecommendations = [
    "Create a comprehensive guide about 'keyword research methods'",
    "Develop a comparison post about different 'backlink checkers'",
    "Update your existing content on 'seo analysis' with latest tools and methods",
    "Create FAQ content addressing common questions about 'website ranking'",
    "Add a case study showcasing successful SEO optimization",
    "Write a tutorial on using 'meta descriptions' effectively",
    "Develop a glossary of SEO terms for beginners"
  ];
  
  return {
    onPage: onPageRecommendations,
    technical: technicalRecommendations,
    content: contentRecommendations
  };
};

interface SeoRecommendationsCardProps {
  domain: string;
}

const SeoRecommendationsCard = ({ domain }: SeoRecommendationsCardProps) => {
  const [recommendations, setRecommendations] = useState<{
    onPage: string[];
    technical: string[];
    content: string[];
  }>({
    onPage: [],
    technical: [],
    content: []
  });
  
  useEffect(() => {
    const data = generateSeoRecommendations(domain);
    setRecommendations(data);
  }, [domain]);

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>SEO Recommendations</CardTitle>
        <CardDescription>Actionable suggestions to improve your SEO performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="onPage" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="onPage">On-Page</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="onPage" className="space-y-4">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                {recommendations.onPage.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-4">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                {recommendations.technical.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                {recommendations.content.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SeoRecommendationsCard;

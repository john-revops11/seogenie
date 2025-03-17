
import { useEffect, useRef } from "react";
import { Search, BarChart2, Globe, TrendingUp, Award, Zap } from "lucide-react";

export function SeoAnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const icons = container.querySelectorAll('.seo-icon');
    
    const animateIcons = () => {
      icons.forEach((icon) => {
        // Random position
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;
        
        // Random size between 2rem and 5rem
        const size = 2 + Math.random() * 3;
        
        // Random opacity between 0.1 and 0.3
        const opacity = 0.1 + Math.random() * 0.2;
        
        // Random animation duration between 15s and 30s
        const duration = 15 + Math.random() * 15;
        
        // Random delay between 0s and 10s
        const delay = Math.random() * 10;
        
        // Set CSS properties
        const iconEl = icon as HTMLElement;
        iconEl.style.left = `${xPos}%`;
        iconEl.style.top = `${yPos}%`;
        iconEl.style.width = `${size}rem`;
        iconEl.style.height = `${size}rem`;
        iconEl.style.opacity = opacity.toString();
        iconEl.style.animationDuration = `${duration}s`;
        iconEl.style.animationDelay = `${delay}s`;
      });
    };
    
    animateIcons();
    
    // Re-animate icons every 30s
    const intervalId = setInterval(animateIcons, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-4xl font-bold mb-6 text-green-800 dark:text-green-400">
          Powerful SEO Analytics
        </h2>
        <p className="text-xl mb-8 text-slate-700 dark:text-slate-300 max-w-md">
          Gain insights, track performance, and outrank your competitors with our comprehensive SEO toolkit.
        </p>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          <FeatureCard 
            icon={<BarChart2 className="h-6 w-6" />}
            title="Analytics"
            description="Track your website's performance metrics in real-time"
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title="Domain Analysis"
            description="Compare your domain against competitors"
          />
          <FeatureCard 
            icon={<TrendingUp className="h-6 w-6" />}
            title="Keyword Tracking"
            description="Monitor your ranking positions for key terms"
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="AI Content"
            description="Generate optimized content that ranks"
          />
        </div>
      </div>
      
      {/* Floating background icons */}
      <Search className="seo-icon text-primary absolute animate-float" />
      <BarChart2 className="seo-icon text-primary absolute animate-float" />
      <Globe className="seo-icon text-primary absolute animate-float" />
      <TrendingUp className="seo-icon text-primary absolute animate-float" />
      <Award className="seo-icon text-primary absolute animate-float" />
      <Zap className="seo-icon text-primary absolute animate-float" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-500/10 dark:from-green-900/20 dark:to-blue-900/20"></div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-lg hover:scale-105 transition-transform shadow-sm">
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

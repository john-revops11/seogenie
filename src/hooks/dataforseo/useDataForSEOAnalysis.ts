
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useDataForSEOAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<DataForSEOAnalysisResult | null>(null);

  const runAnalysis = async (domain: string, keywords: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Clean the domain input
      const cleanDomain = domain.trim().replace(/^https?:\/\//i, '');
      
      // Filter out empty keywords
      const filteredKeywords = keywords.filter(k => k.trim() !== '');
      
      if (filteredKeywords.length === 0) {
        throw new Error('Please enter at least one keyword');
      }
      
      // Call the DataForSEO edge function
      const { data, error } = await supabase.functions.invoke('dataforseo', {
        body: {
          action: 'full_analysis',
          domain: cleanDomain,
          keywords: filteredKeywords,
        },
      });
      
      if (error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from API');
      }
      
      setAnalysisData(data as DataForSEOAnalysisResult);
      toast.success('DataForSEO analysis completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      console.error('DataForSEO analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    runAnalysis, 
    loading, 
    error, 
    analysisData 
  };
}

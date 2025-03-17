
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";

export interface ContentHistoryItem {
  id: string;
  title: string;
  content_type: string;
  keywords: string[];
  meta_description: string | null;
  outline: string[] | null;
  content: string;
  created_at: string;
  rag_enabled: boolean;
  ai_provider: string | null;
  ai_model: string | null;
  user_id: string | null;
  topic: string | null;
}

export function useContentHistory() {
  const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Get the current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionUserId(session.user.id);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSessionUserId(session.user.id);
      } else {
        setSessionUserId(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch content history with pagination
  const fetchHistory = async (page = 1) => {
    setIsLoading(true);
    try {
      // First get the total count
      const { count } = await supabase
        .from("content_history")
        .select("*", { count: "exact", head: true });
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Then get the paginated data
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .order("created_at", { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (error) {
        throw error;
      }

      setHistoryItems(data as ContentHistoryItem[]);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching content history:", error);
      toast.error("Failed to load content history");
    } finally {
      setIsLoading(false);
    }
  };

  // Save generated content to history
  const saveToHistory = async (content: GeneratedContent) => {
    try {
      // Convert blocks to HTML string for storage
      const contentHtml = content.blocks.map(block => block.content).join('\n');
      
      const { error } = await supabase.from("content_history").insert({
        title: content.title,
        content_type: content.contentType || '',
        keywords: content.keywords || [],
        meta_description: content.metaDescription,
        outline: content.outline,
        content: contentHtml,
        rag_enabled: content.generationMethod === 'rag',
        ai_provider: content.aiProvider || null,
        ai_model: content.aiModel || null,
        user_id: sessionUserId,
        topic: content.topic || null
      });

      if (error) {
        throw error;
      }

      toast.success("Content saved to history");
      
      // Refresh history data
      fetchHistory(currentPage);
    } catch (error) {
      console.error("Error saving to history:", error);
      toast.error("Failed to save content to history");
    }
  };

  // Delete a history item
  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Content deleted from history");
      
      // Refresh history data - go to first page if current page is now empty
      const remainingItems = historyItems.filter(item => item.id !== id);
      if (remainingItems.length === 0 && currentPage > 1) {
        fetchHistory(currentPage - 1);
      } else {
        fetchHistory(currentPage);
      }
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("Failed to delete content");
    }
  };

  // Get a specific history item by ID
  const getHistoryItemById = async (id: string): Promise<ContentHistoryItem | null> => {
    try {
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data as ContentHistoryItem;
    } catch (error) {
      console.error("Error fetching history item:", error);
      toast.error("Failed to load content item");
      return null;
    }
  };

  // Load history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    historyItems,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    fetchHistory,
    saveToHistory,
    deleteHistoryItem,
    getHistoryItemById,
    currentUserId: sessionUserId
  };
}


import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  History, 
  FileText, 
  Calendar, 
  Copy, 
  Trash, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Download,
  Eye,
  User
} from "lucide-react";
import { useContentHistory, ContentHistoryItem } from "@/hooks/content-generator/useContentHistory";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContentGeneratorState } from "@/hooks/content-generator/useContentGeneratorState";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { v4 as uuidv4 } from 'uuid';

interface ContentHistoryProps {
  onViewContent?: (content: ContentHistoryItem) => void;
}

const ContentHistory: React.FC<ContentHistoryProps> = ({ 
  onViewContent 
}) => {
  const { 
    historyItems, 
    isLoading, 
    currentPage, 
    totalPages,
    fetchHistory, 
    deleteHistoryItem,
    getHistoryItemById,
    currentUserId
  } = useContentHistory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentHistoryItem | null>(null);
  const [usernames, setUsernames] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  
  // Get usernames for user IDs
  useEffect(() => {
    const getUsernames = async () => {
      const userIds = Array.from(new Set(
        historyItems
          .filter(item => item.user_id)
          .map(item => item.user_id as string)
      ));
      
      if (userIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
          
        if (error) throw error;
        
        const usernameMap = {};
        data.forEach(profile => {
          const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
          usernameMap[profile.id] = name || profile.email.split('@')[0];
        });
        
        setUsernames(usernameMap);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };
    
    if (historyItems.length > 0) {
      getUsernames();
    }
  }, [historyItems]);

  // Filter items based on search term
  const filteredItems = historyItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.content_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.user_id && usernames[item.user_id] && usernames[item.user_id].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date function
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  // Copy content to clipboard
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Content copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy content");
    });
  };

  // Download content as a text file
  const downloadContent = (item: ContentHistoryItem) => {
    const element = document.createElement("a");
    const file = new Blob([item.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // View content details
  const handleViewContent = (item: ContentHistoryItem) => {
    setSelectedItem(item);
    if (onViewContent) {
      onViewContent(item);
    }
  };
  
  // Load content in the generator
  const loadContentInGenerator = async (item: ContentHistoryItem) => {
    try {
      // Convert the history item to a GeneratedContent object
      const contentBlocks: ContentBlock[] = item.content.split('\n').map(html => ({
        id: uuidv4(),
        type: html.startsWith('<h1>') ? 'heading1' : 
              html.startsWith('<h2>') ? 'heading2' : 
              html.startsWith('<h3>') ? 'heading3' : 'paragraph',
        content: html,
        metadata: {}
      }));
      
      const generatedContent: GeneratedContent = {
        title: item.title,
        contentType: item.content_type,
        keywords: item.keywords,
        metaDescription: item.meta_description || '',
        outline: item.outline || [],
        content: item.content,
        blocks: contentBlocks,
        generationMethod: item.rag_enabled ? 'rag' : 'standard',
        aiProvider: item.ai_provider || 'openai',
        aiModel: item.ai_model || 'gpt-4',
        topic: item.topic || undefined
      };
      
      // Save the content to localStorage
      const contentStateToSave = {
        step: 5,
        contentType: item.content_type,
        selectedTemplateId: '',
        title: item.title,
        keywords: item.keywords,
        creativity: 50,
        ragEnabled: item.rag_enabled,
        isGenerating: false,
        generatedContent: generatedContent,
        contentHtml: item.content,
        aiProvider: item.ai_provider || 'openai',
        aiModel: item.ai_model || 'gpt-4',
        wordCountOption: 'standard',
        selectedSubheadings: item.outline || [],
        contentPreferences: [],
        topic: item.topic || ''
      };
      
      localStorage.setItem('contentGeneratorState', JSON.stringify(contentStateToSave));
      
      // Navigate to content generator
      toast.success("Content loaded in generator");
      navigate('/content');
    } catch (error) {
      console.error("Error loading content in generator:", error);
      toast.error("Failed to load content in generator");
    }
  };

  return (
    <div className="space-y-6">
      {selectedItem ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Content Preview</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedItem(null)}
            >
              Back to History
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{selectedItem.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedItem.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline">{keyword}</Badge>
                  ))}
                </div>
                {selectedItem.topic && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Topic: </span>
                    <Badge variant="secondary">{selectedItem.topic}</Badge>
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <User className="mr-1 h-4 w-4" />
                  <span>
                    {selectedItem.user_id ? usernames[selectedItem.user_id] || 'Unknown User' : 'Unknown User'}
                  </span>
                  <span className="mx-2">•</span>
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{formatDate(selectedItem.created_at)}</span>
                  <span className="mx-2">•</span>
                  <Badge variant={selectedItem.rag_enabled ? "default" : "outline"}>
                    {selectedItem.rag_enabled ? "RAG Enhanced" : "Standard Generation"}
                  </Badge>
                </div>
              </div>
              
              <div className="prose max-w-none dark:prose-invert" 
                dangerouslySetInnerHTML={{ __html: selectedItem.content }} 
              />
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyContent(selectedItem.content)}
                >
                  <Copy className="mr-2 size-4" /> Copy Content
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadContent(selectedItem)}
                >
                  <Download className="mr-2 size-4" /> Download
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => loadContentInGenerator(selectedItem)}
                >
                  <FileText className="mr-2 size-4" /> Open in Generator
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Content History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-revology border-opacity-50 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No content history found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate some content to see it in your history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>RAG</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewContent(item)}
                      >
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.content_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.topic ? (
                            <Badge variant="secondary">{item.topic}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {item.user_id ? usernames[item.user_id] || 'Unknown' : 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(item.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.rag_enabled ? "default" : "secondary"}>
                            {item.rag_enabled ? "RAG" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadContentInGenerator(item);
                              }}
                              title="Open in Generator"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyContent(item.content);
                              }}
                              title="Copy Content"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadContent(item);
                              }}
                              title="Download Content"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this content?")) {
                                  deleteHistoryItem(item.id);
                                }
                              }}
                              title="Delete Content"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchHistory(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentHistory;

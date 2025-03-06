import { useState } from "react";
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
  Eye
} from "lucide-react";
import { useContentHistory, ContentHistoryItem } from "@/hooks/content-generator/useContentHistory";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    deleteHistoryItem 
  } = useContentHistory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentHistoryItem | null>(null);

  // Filter items based on search term
  const filteredItems = historyItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.content_type.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <TableHead>Keywords</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.content_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.slice(0, 2).map((keyword, i) => (
                              <Badge key={i} variant="secondary" className="mr-1">
                                {keyword}
                              </Badge>
                            ))}
                            {item.keywords.length > 2 && (
                              <Badge variant="secondary">+{item.keywords.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewContent(item)}
                              title="View Content"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyContent(item.content)}
                              title="Copy Content"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadContent(item)}
                              title="Download Content"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
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

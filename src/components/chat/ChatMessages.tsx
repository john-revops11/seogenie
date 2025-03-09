
import React, { useRef, useEffect } from "react";
import { Bot, Sparkles, User, FileIcon, Table } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table as UITable, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Message } from "./types";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderFileAttachment = (file: any) => {
    return (
      <div key={file.id} className="mt-2 p-2 bg-secondary/20 rounded-md text-sm">
        <div className="flex items-center gap-2 mb-1">
          <FileIcon className="h-4 w-4" />
          <span className="font-medium">{file.name}</span>
        </div>
        
        {file.analysis && (
          <div className="mt-1 space-y-2">
            {file.analysis.tables && file.analysis.tables.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                  <Table className="h-3 w-3" />
                  <span>Extracted Tables</span>
                </div>
                
                {file.analysis.tables.slice(0, 2).map((table: any, tableIndex: number) => (
                  <div key={tableIndex} className="overflow-x-auto mb-2">
                    <UITable className="w-full border-collapse text-xs">
                      <TableHeader>
                        <TableRow>
                          {Object.keys(table[0] || {}).slice(0, 6).map((header, i) => (
                            <TableHead key={i} className="py-1 px-2 bg-primary/10 text-primary">
                              {header}
                            </TableHead>
                          ))}
                          {Object.keys(table[0] || {}).length > 6 && (
                            <TableHead className="py-1 px-2 bg-primary/10 text-primary">...</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.slice(0, 3).map((row: any, rowIdx: number) => (
                          <TableRow key={rowIdx}>
                            {Object.values(row).slice(0, 6).map((cell: any, cellIdx: number) => (
                              <TableCell key={cellIdx} className="py-1 px-2 border-t">
                                {String(cell).substring(0, 30)}
                                {String(cell).length > 30 ? '...' : ''}
                              </TableCell>
                            ))}
                            {Object.values(row).length > 6 && (
                              <TableCell className="py-1 px-2 border-t">...</TableCell>
                            )}
                          </TableRow>
                        ))}
                        {table.length > 3 && (
                          <TableRow>
                            <TableCell 
                              colSpan={Math.min(Object.keys(table[0] || {}).length, 7)} 
                              className="text-center py-1 px-2 border-t text-muted-foreground"
                            >
                              {table.length - 3} more rows
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                ))}
                
                {file.analysis.tables.length > 2 && (
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    + {file.analysis.tables.length - 2} more tables
                  </div>
                )}
              </div>
            )}
            
            {file.analysis.summary && (
              <div className="text-xs">
                <span className="font-medium">Summary:</span> {file.analysis.summary}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="flex-1 p-4 mb-4 flex flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`rounded-full p-2 ${message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {message.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <Card className={`p-3 ${message.role === 'assistant' ? 'bg-muted' : 'bg-primary/10'}`}>
                  {message.isLoading ? (
                    <div className="animate-pulse flex space-x-2 items-center">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Display file attachments for user messages */}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            {message.files.length} attached file{message.files.length > 1 ? 's' : ''}:
                          </div>
                          {message.files.map(file => renderFileAttachment(file))}
                        </div>
                      )}
                      
                      {message.ragInfo?.used && (
                        <div className="mt-2 flex items-center gap-1">
                          <Badge variant="outline" className="text-xs flex items-center gap-1 px-1 py-0">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span className="text-xs">RAG-enhanced</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ChatMessages;

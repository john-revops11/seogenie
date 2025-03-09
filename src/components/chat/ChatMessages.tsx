
import React, { useRef, useEffect } from "react";
import { Bot, Sparkles, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  return (
    <Card className="flex-1 p-4 mb-4 flex flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
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

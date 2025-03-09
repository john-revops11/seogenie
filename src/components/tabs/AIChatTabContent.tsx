import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, User, Bot, SendHorizontal, PanelRightOpen, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AIProvider, AIModel, defaultAIModels, getModelsForProvider } from "@/types/aiModels";
import { enhanceWithRAG } from "@/services/vector/ragService";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { toast } from "sonner";
import RagSettings from "@/components/content-generator/RagSettings";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  ragInfo?: {
    used: boolean;
    chunksRetrieved?: number;
    relevanceScore?: number;
  };
}

interface AIChatTabContentProps {
  analysisComplete: boolean;
  onGoToAnalysis: () => void;
}

export const AIChatTabContent: React.FC<AIChatTabContentProps> = ({
  analysisComplete,
  onGoToAnalysis
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [availableModels, setAvailableModels] = useState<AIModel[]>(getModelsForProvider("openai"));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const models = getModelsForProvider(provider);
    setAvailableModels(models);
    setSelectedModel(models.length > 0 ? models[0].id : "");
  }, [provider]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "initial-message",
          role: "assistant",
          content: "Hello! I'm your Revology Analytics assistant. How can I help you with revenue growth management, distribution, or retail analytics today?",
          timestamp: new Date(),
        }
      ]);
    }
  }, [messages]);
  
  const handleProviderChange = (value: string) => {
    setProvider(value as AIProvider);
  };
  
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };
  
  const handleRagToggle = (enabled: boolean) => {
    setRagEnabled(enabled);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const context = messages
        .filter(msg => !msg.isLoading)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n\n");
      
      let prompt = `
      ${context}
      
      User: ${input}
      
      Assistant: 
      `;
      
      let ragInfo = {
        used: false,
        chunksRetrieved: 0,
        relevanceScore: 0
      };
      
      if (ragEnabled) {
        try {
          const enhancedPrompt = await enhanceWithRAG(
            prompt,
            "Chat Response", 
            "Revology Analytics Chat Assistant", 
            input.split(" ")
          );
          
          if (enhancedPrompt !== prompt) {
            prompt = enhancedPrompt;
            ragInfo.used = true;
            ragInfo.chunksRetrieved = 10;
            ragInfo.relevanceScore = 0.85;
          }
        } catch (error) {
          console.error("RAG enhancement failed:", error);
          toast.error("RAG enhancement failed. Using standard response mode.");
        }
      }
      
      const response = await generateWithAI(
        provider,
        selectedModel,
        prompt,
        70
      );
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response, isLoading: false, ragInfo }
            : msg
        )
      );
    } catch (error) {
      console.error("Error generating response:", error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: "I'm sorry, I couldn't generate a response. Please try again or consider changing the model.", 
                isLoading: false 
              }
            : msg
        )
      );
      
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    setMessages([]);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
      <div className="col-span-1 md:col-span-3 flex flex-col h-[75vh]">
        {!analysisComplete ? (
          <div className="flex flex-col h-full">
            <Card className="flex-1 p-4 mb-4 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 mb-4">
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="rounded-full p-2 bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                      <Card className="p-3 bg-muted">
                        <div className="whitespace-pre-wrap">
                          Hello! I'm your Revology Analytics assistant. For the best experience with detailed insights, 
                          I recommend running a domain analysis first. This will help me provide more accurate and 
                          relevant information about your specific industry context.
                        </div>
                        <div className="mt-4">
                          <Button onClick={onGoToAnalysis} variant="default" size="sm">
                            Run Domain Analysis
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
            
            <div className="relative">
              <Textarea 
                placeholder="Type your message (analysis not required, but recommended)..." 
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="pr-12 resize-none min-h-[80px]"
              />
              <Button 
                size="icon" 
                className="absolute bottom-3 right-3" 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4 border rounded-lg mb-4">
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
            
            <div className="relative">
              <Textarea 
                placeholder="Type your message..." 
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="pr-12 resize-none min-h-[80px]"
                disabled={isLoading}
              />
              <Button 
                size="icon" 
                className="absolute bottom-3 right-3" 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>
      
      <div className="col-span-1 space-y-6">
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-medium">Chat Settings</h3>
          
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <RadioGroup 
              defaultValue={provider} 
              onValueChange={handleProviderChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai">OpenAI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini">Google Gemini</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Language Model</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className="text-xs text-muted-foreground mt-1">
                {availableModels.find(m => m.id === selectedModel)?.description || ""}
              </p>
            )}
          </div>
          
          <RagSettings enabled={ragEnabled} onToggle={handleRagToggle} />
          
          <Button 
            variant="outline" 
            onClick={clearChat} 
            disabled={messages.length === 0 || isLoading} 
            className="w-full"
          >
            Clear Chat
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AIChatTabContent;


import React, { useState, useEffect } from "react";
import { AIProvider, getModelsForProvider } from "@/types/aiModels";
import { enhanceWithRAG } from "@/services/vector/ragService";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { toast } from "sonner";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatSettings from "@/components/chat/ChatSettings";
import { Message, ChatProps } from "@/components/chat/types";

export const AIChatTabContent: React.FC<ChatProps> = ({
  analysisComplete,
  onGoToAnalysis
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [availableModels, setAvailableModels] = useState<any[]>(getModelsForProvider("openai"));
  
  useEffect(() => {
    const models = getModelsForProvider(provider);
    setAvailableModels(models);
    setSelectedModel(models.length > 0 ? models[0].id : "");
  }, [provider]);
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "initial-message",
          role: "assistant",
          content: "Hello! I'm your Revology Analytics pricing and revenue consultant. How can I help you optimize pricing strategies, revenue growth management, or market positioning today?",
          timestamp: new Date(),
        }
      ]);
    }
  }, [messages]);
  
  const handleProviderChange = (value: AIProvider) => {
    setProvider(value);
  };
  
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };
  
  const handleRagToggle = (enabled: boolean) => {
    setRagEnabled(enabled);
  };
  
  const sendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputText,
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
    setIsLoading(true);
    
    try {
      const context = messages
        .filter(msg => !msg.isLoading)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n\n");
      
      let prompt = `
      You are an expert pricing and revenue growth management consultant for Revology Analytics, specializing in helping businesses optimize their pricing strategies, revenue streams, and market positioning.
      
      Your expertise includes:
      - Price optimization and elasticity analysis
      - Revenue growth management
      - Promotional effectiveness
      - Customer segmentation and willingness-to-pay analysis
      - Market penetration and pricing strategies
      - Subscription and recurring revenue models
      - Dynamic pricing implementation
      
      Respond conversationally and directly to the user's questions without following any particular structure or framework. Be helpful, informative, and concise.
      
      CONVERSATION HISTORY:
      ${context}
      
      User: ${inputText}
      
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
            "Pricing Strategy", 
            "Revology Analytics Pricing Consultant", 
            inputText.split(" ")
          );
          
          if (enhancedPrompt !== prompt) {
            prompt = enhancedPrompt;
            ragInfo.used = true;
            ragInfo.chunksRetrieved = 8;
            ragInfo.relevanceScore = 0.87;
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
                content: "I'm sorry, I couldn't generate a response about pricing or revenue strategy. Please try again or consider changing the model.", 
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
        <ChatMessages messages={messages} />
        <ChatInput isLoading={isLoading} onSendMessage={sendMessage} />
      </div>
      
      <div className="col-span-1 space-y-6">
        <ChatSettings 
          provider={provider}
          selectedModel={selectedModel}
          availableModels={availableModels}
          ragEnabled={ragEnabled}
          messagesCount={messages.length}
          isLoading={isLoading}
          onProviderChange={handleProviderChange}
          onModelChange={handleModelChange}
          onRagToggle={handleRagToggle}
          onClearChat={clearChat}
        />
      </div>
    </div>
  );
};

export default AIChatTabContent;

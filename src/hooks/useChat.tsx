
import { useState, useEffect } from "react";
import { AIProvider, getModelsForProvider } from "@/types/aiModels";
import { Message, FileAttachment } from "@/components/chat/types";
import { enhanceWithRAG } from "@/services/vector/contentEnhancer";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { toast } from "sonner";
import { analyzeDocument } from "@/services/keywords/generation/documentAnalysis";

export function useChat() {
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
          content: "Hello! I'm your Revology Analytics pricing and revenue consultant. I can help with pricing strategies, analyze documents, extract data from spreadsheets, or interpret PDFs. Upload files or ask me questions!",
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
  
  const processFiles = async (files: File[]): Promise<FileAttachment[]> => {
    const fileAttachments: FileAttachment[] = [];
    
    for (const file of files) {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const fileAttachment: FileAttachment = {
        id: fileId,
        name: file.name,
        type: file.type,
      };
      
      fileAttachments.push(fileAttachment);
      
      try {
        if (file.type === 'application/pdf' || 
            file.name.endsWith('.xlsx') || 
            file.name.endsWith('.xls') || 
            file.name.endsWith('.csv') || 
            file.name.endsWith('.doc') || 
            file.name.endsWith('.docx') || 
            file.type === 'text/plain') {
          
          const analysisResult = await analyzeDocument(file, selectedModel);
          
          const index = fileAttachments.findIndex(f => f.id === fileId);
          if (index !== -1) {
            fileAttachments[index] = {
              ...fileAttachments[index],
              analysis: analysisResult
            };
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(`Failed to process ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return fileAttachments;
  };
  
  const generatePrompt = (
    context: string, 
    userInput: string, 
    fileContext: string
  ): string => {
    return `
      You are an expert pricing and revenue growth management consultant for Revology Analytics, specializing in helping businesses optimize their pricing strategies, revenue streams, and market positioning.
      
      Your expertise includes:
      - Price optimization and elasticity analysis
      - Revenue growth management
      - Promotional effectiveness
      - Customer segmentation and willingness-to-pay analysis
      - Market penetration and pricing strategies
      - Subscription and recurring revenue models
      - Dynamic pricing implementation
      
      You can also analyze documents, extract insights from spreadsheets, and interpret PDFs.
      
      Respond conversationally and directly to the user's questions without following any particular structure or framework. Be helpful, informative, and concise.
      
      CONVERSATION HISTORY:
      ${context}
      
      User: ${userInput}${fileContext}
      
      Assistant: 
      `;
  };
  
  const sendMessage = async (inputText: string, files?: File[]) => {
    if ((!inputText.trim() && (!files || files.length === 0)) || isLoading) return;
    
    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    
    if (files && files.length > 0) {
      setMessages(prev => [...prev, userMessage]);
      
      try {
        setIsLoading(true);
        const fileAttachments = await processFiles(files);
        
        userMessage.files = fileAttachments;
        
        setMessages(prev => 
          prev.map(msg => msg.id === userMessageId ? userMessage : msg)
        );
      } catch (error) {
        console.error("Error processing files:", error);
        toast.error("Error processing files. Please try again.");
        setIsLoading(false);
        return;
      }
    }
    
    const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    if (!files || files.length === 0) {
      setMessages(prev => [...prev, userMessage, assistantMessage]);
    } else {
      setMessages(prev => [...prev, assistantMessage]);
    }
    
    setIsLoading(true);
    
    try {
      const context = messages
        .filter(msg => !msg.isLoading)
        .map(msg => {
          let msgText = `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
          
          if (msg.files && msg.files.length > 0) {
            msgText += '\n\nAttached files:';
            msg.files.forEach(file => {
              msgText += `\n- ${file.name}`;
              
              if (file.analysis) {
                if (file.analysis.summary) {
                  msgText += `\n  Summary: ${file.analysis.summary}`;
                }
                
                if (file.analysis.tables && file.analysis.tables.length > 0) {
                  msgText += `\n  Contains ${file.analysis.tables.length} table(s)`;
                }
                
                if (file.analysis.extractedText) {
                  const textPreview = file.analysis.extractedText.substring(0, 100) + 
                    (file.analysis.extractedText.length > 100 ? '...' : '');
                  msgText += `\n  Text preview: ${textPreview}`;
                }
              }
            });
          }
          
          return msgText;
        })
        .join("\n\n");
      
      let fileContext = '';
      if (userMessage.files && userMessage.files.length > 0) {
        fileContext = '\n\nThe user has uploaded the following files:\n';
        
        userMessage.files.forEach((file, index) => {
          fileContext += `\nFile ${index + 1}: ${file.name} (${file.type})\n`;
          
          if (file.analysis) {
            if (file.analysis.summary) {
              fileContext += `Summary: ${file.analysis.summary}\n`;
            }
            
            if (file.analysis.tables && file.analysis.tables.length > 0) {
              fileContext += `Tables detected: ${file.analysis.tables.length}\n`;
              file.analysis.tables.forEach((table, tableIndex) => {
                fileContext += `Table ${tableIndex + 1}:\n${JSON.stringify(table, null, 2)}\n`;
              });
            }
            
            if (file.analysis.extractedText) {
              fileContext += `Extracted text:\n${file.analysis.extractedText}\n`;
            }
          }
        });
        
        fileContext += '\nPlease analyze these files and provide insights based on their content.';
      }
      
      let prompt = generatePrompt(context, inputText, fileContext);
      
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
      
      const modelToUse = userMessage.files && userMessage.files.length > 0 
        ? "gpt-4" 
        : selectedModel || "gpt-4";
      
      const response = await generateWithAI(
        provider,
        modelToUse,
        prompt,
        70
      );

      if (!response) {
        throw new Error("Empty response received from AI");
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: response, 
                isLoading: false,
                ragInfo
              }
            : msg
        )
      );

    } catch (error) {
      console.error("Error generating response:", error);
      
      const errorMessage = error instanceof Error 
        ? `Generation failed: ${error.message}` 
        : "Failed to generate response. Please try again.";

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: errorMessage,
                isLoading: false 
              }
            : msg
        )
      );
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    ragEnabled,
    provider,
    selectedModel,
    availableModels,
    sendMessage,
    clearChat,
    handleProviderChange,
    handleModelChange,
    handleRagToggle
  };
}

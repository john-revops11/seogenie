
import React from "react";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatSettings from "@/components/chat/ChatSettings";
import { Message } from "@/components/chat/types";
import { AIProvider } from "@/types/aiModels";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  provider: AIProvider;
  selectedModel: string;
  availableModels: any[];
  ragEnabled: boolean;
  onSendMessage: (message: string, files?: File[]) => void;
  onClearChat: () => void;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onRagToggle: (enabled: boolean) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  provider,
  selectedModel,
  availableModels,
  ragEnabled,
  onSendMessage,
  onClearChat,
  onProviderChange,
  onModelChange,
  onRagToggle
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
      <div className="col-span-1 md:col-span-3 flex flex-col h-[75vh]">
        <ChatMessages messages={messages} />
        <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
      </div>
      
      <div className="col-span-1 space-y-6">
        <ChatSettings 
          provider={provider}
          selectedModel={selectedModel}
          availableModels={availableModels}
          ragEnabled={ragEnabled}
          messagesCount={messages.length}
          isLoading={isLoading}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          onRagToggle={onRagToggle}
          onClearChat={onClearChat}
        />
      </div>
    </div>
  );
};

export default ChatContainer;

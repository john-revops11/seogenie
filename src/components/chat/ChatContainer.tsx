
import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatSettings from "./ChatSettings";
import useAiChat from "@/hooks/useAiChat";
import { ChatProps } from "./types";

export const ChatContainer: React.FC<ChatProps> = ({
  analysisComplete,
  onGoToAnalysis
}) => {
  const {
    messages,
    isLoading,
    ragEnabled,
    provider,
    selectedModel,
    availableModels,
    handleProviderChange,
    handleModelChange,
    handleRagToggle,
    sendMessage,
    clearChat
  } = useAiChat();
  
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

export default ChatContainer;

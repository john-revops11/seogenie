
import React from "react";
import { useChat } from "@/hooks/useChat";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatProps } from "@/components/chat/types";

export const AIChatTabContent: React.FC<ChatProps> = ({
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
    sendMessage,
    clearChat,
    handleProviderChange,
    handleModelChange,
    handleRagToggle
  } = useChat();
  
  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      provider={provider}
      selectedModel={selectedModel}
      availableModels={availableModels}
      ragEnabled={ragEnabled}
      onSendMessage={sendMessage}
      onClearChat={clearChat}
      onProviderChange={handleProviderChange}
      onModelChange={handleModelChange}
      onRagToggle={handleRagToggle}
    />
  );
};

export default AIChatTabContent;

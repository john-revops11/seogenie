
import React from "react";
import { ChatProps } from "@/components/chat/types";
import ChatContainer from "@/components/chat/ChatContainer";

export const AIChatTabContent: React.FC<ChatProps> = ({
  analysisComplete,
  onGoToAnalysis
}) => {
  return <ChatContainer analysisComplete={analysisComplete} onGoToAnalysis={onGoToAnalysis} />;
};

export default AIChatTabContent;

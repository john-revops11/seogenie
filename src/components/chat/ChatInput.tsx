
import React, { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ isLoading, onSendMessage }) => {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="relative">
      <Textarea 
        placeholder="Ask about pricing strategies, revenue optimization, or market positioning..." 
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="pr-12 resize-none min-h-[80px]"
        disabled={isLoading}
      />
      <Button 
        size="icon" 
        className="absolute bottom-3 right-3" 
        onClick={handleSendMessage}
        disabled={!input.trim() || isLoading}
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatInput;

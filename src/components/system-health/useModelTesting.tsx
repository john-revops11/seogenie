
import { useState } from "react";
import { testAiModel } from "@/utils/apiHealthCheck";

export const useModelTesting = () => {
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"openai" | "gemini">("openai");
  const [testModelStatus, setTestModelStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testResponse, setTestResponse] = useState<string>("");
  
  const handleTestModels = (provider: "openai" | "gemini") => {
    setActiveProvider(provider);
    setShowModelDialog(true);
  };

  const handleTestModel = async (modelId: string, prompt: string) => {
    await testAiModel(modelId, prompt, setTestModelStatus, setTestResponse);
  };

  return {
    showModelDialog,
    setShowModelDialog,
    activeProvider,
    testModelStatus,
    testResponse,
    handleTestModels,
    handleTestModel
  };
};

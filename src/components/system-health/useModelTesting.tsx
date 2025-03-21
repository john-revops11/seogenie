
import { useState } from "react";
import { testAiModel } from "@/utils/apiHealthCheck";
import { ApiStatus } from "@/types/systemHealth";

export const useModelTesting = () => {
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"openai" | "gemini">("openai");
  const [testModelStatus, setTestModelStatus] = useState<ApiStatus>("idle");
  const [testResponse, setTestResponse] = useState<string>("");
  
  const handleTestModels = (provider: "openai" | "gemini") => {
    setActiveProvider(provider);
    setShowModelDialog(true);
  };

  const handleTestModel = async (modelId: string, prompt: string): Promise<void> => {
    try {
      setTestModelStatus("loading");
      await testAiModel(modelId, prompt, setTestModelStatus, setTestResponse);
      return Promise.resolve();
    } catch (error) {
      setTestModelStatus("error");
      setTestResponse(error instanceof Error ? error.message : "Unknown error occurred");
      return Promise.reject(error);
    }
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

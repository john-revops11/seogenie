
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AIProvider } from "@/types/aiModels";

interface ModelTesterProps {
  apiProvider: AIProvider;
  modelId: string;
  apiKey: string;
}

export const ModelTester: React.FC<ModelTesterProps> = ({
  apiProvider,
  modelId,
  apiKey
}) => {
  const [testPrompt, setTestPrompt] = useState<string>("Explain why SEO is important for websites in one paragraph.");
  const [testResponse, setTestResponse] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);

  const testOpenAIModel = async () => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: testPrompt }
          ],
          max_tokens: 150
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to get response from OpenAI");
      }
      
      setTestResponse(data.choices[0].message.content);
      return true;
    } catch (error) {
      console.error("OpenAI test error:", error);
      setTestError(error.message || "Failed to test OpenAI model");
      return false;
    }
  };

  const testGeminiModel = async () => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: testPrompt }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to get response from Gemini");
      }
      
      setTestResponse(data.candidates[0].content.parts[0].text);
      return true;
    } catch (error) {
      console.error("Gemini test error:", error);
      setTestError(error.message || "Failed to test Gemini model");
      return false;
    }
  };

  const handleTest = async () => {
    if (!apiKey) {
      toast.error("Please enter an API key first");
      return;
    }

    if (!testPrompt.trim()) {
      toast.error("Please enter a test prompt");
      return;
    }

    setIsTesting(true);
    setTestResponse("");
    setTestError(null);

    try {
      let success = false;
      
      if (apiProvider === "openai") {
        success = await testOpenAIModel();
      } else if (apiProvider === "gemini") {
        success = await testGeminiModel();
      }
      
      if (success) {
        toast.success(`${apiProvider.toUpperCase()} model test successful!`);
      }
    } catch (error) {
      console.error(`Error testing ${apiProvider} model:`, error);
      setTestError(error.message || "Unknown error occurred");
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testPrompt">Test Prompt</Label>
        <Textarea
          id="testPrompt"
          placeholder="Enter a prompt to test the model"
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          rows={3}
        />
      </div>
      
      <Button 
        onClick={handleTest} 
        disabled={isTesting || !apiKey || !testPrompt.trim() || !modelId}
        className="w-full"
      >
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Testing Model...
          </>
        ) : (
          "Test Model"
        )}
      </Button>
      
      {testError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{testError}</AlertDescription>
        </Alert>
      )}
      
      {testResponse && (
        <div className="space-y-2 mt-4">
          <Label>Model Response:</Label>
          <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {testResponse}
          </div>
        </div>
      )}
    </div>
  );
};

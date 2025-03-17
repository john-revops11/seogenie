
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateContentOutline } from "@/services/vector/contentOutlineGenerator";

export function useSubheadingRecommendations(
  title: string,
  keywords: string[],
  contentType: string
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [suggestedSubheadings, setSuggestedSubheadings] = useState<string[]>([]);
  const [selectedSubheadings, setSelectedSubheadings] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedHeading, setEditedHeading] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [regenerationCount, setRegenerationCount] = useState(0);

  useEffect(() => {
    fetchSubheadings();
  }, [title, keywords, contentType]);

  const fetchSubheadings = async () => {
    setIsLoading(true);
    try {
      const outline = await generateContentOutline(title, keywords, contentType, regenerationCount);
      setSuggestedSubheadings(outline.headings);
      setSelectedSubheadings(outline.headings);
    } catch (error) {
      console.error("Error generating subheadings:", error);
      toast.error("Failed to generate subheadings. Please try again.");
      const fallbackHeadings = [
        "Introduction",
        "The Problem",
        "The Process",
        "The Payoff",
        "Conclusion"
      ];
      setSuggestedSubheadings(fallbackHeadings);
      setSelectedSubheadings(fallbackHeadings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubheadingToggle = (heading: string) => {
    setSelectedSubheadings(prev => 
      prev.includes(heading) 
        ? prev.filter(h => h !== heading) 
        : [...prev, heading]
    );
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedHeading(suggestedSubheadings[index]);
  };

  const handleSaveEdit = () => {
    if (editIndex === null) return;
    if (!editedHeading.trim()) {
      toast.error("Subheading cannot be empty");
      return;
    }

    const updatedHeadings = [...suggestedSubheadings];
    updatedHeadings[editIndex] = editedHeading;
    setSuggestedSubheadings(updatedHeadings);

    if (selectedSubheadings.includes(suggestedSubheadings[editIndex])) {
      setSelectedSubheadings(prev => 
        prev.map(h => h === suggestedSubheadings[editIndex] ? editedHeading : h)
      );
    }

    setEditIndex(null);
    setEditedHeading("");
    toast.success("Subheading updated");
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedHeading("");
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      setRegenerationCount(prev => prev + 1);
      setTimeout(async () => {
        await fetchSubheadings();
        toast.success("Subheadings regenerated with new variations");
        setIsRegenerating(false);
      }, 100);
    } catch (error) {
      console.error("Error regenerating subheadings:", error);
      toast.error("Failed to regenerate subheadings");
      setIsRegenerating(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsRegenerating(true);
    setIsPromptDialogOpen(false);
    
    try {
      const processedPrompt = `Using the Revology Analytics content framework (Problem, Process, Payoff, Proposition) and focusing on ${title}, please generate subheadings for a ${contentType} that incorporates these keywords: ${keywords.join(', ')}. Custom instructions: ${customPrompt}`;
      
      console.log("Using custom prompt:", processedPrompt);
      toast.info("Generating subheadings from your custom prompt...");
      
      const outline = await generateContentOutline(
        title, 
        keywords, 
        contentType, 
        regenerationCount, 
        processedPrompt
      );
      
      toast.success("Generated subheadings from your custom prompt");
      
      setSuggestedSubheadings(outline.headings);
      setSelectedSubheadings(outline.headings);
    } catch (error) {
      console.error("Error generating subheadings from prompt:", error);
      toast.error("Failed to generate subheadings from prompt");
    } finally {
      setIsRegenerating(false);
      setCustomPrompt("");
    }
  };

  return {
    isLoading,
    isRegenerating,
    suggestedSubheadings,
    selectedSubheadings,
    editIndex,
    editedHeading,
    isPromptDialogOpen,
    customPrompt,
    setEditedHeading,
    setIsPromptDialogOpen,
    setCustomPrompt,
    handleSubheadingToggle,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    handleRegenerate,
    handleGenerateFromPrompt
  };
}


import { useState } from "react";

export function useApiManagement() {
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  const handleAddNewApi = () => {
    if (!newApiName.trim() || !newApiKey.trim()) {
      return false;
    }
    
    setNewApiName("");
    setNewApiKey("");
    setShowApiForm(false);
    return true;
  };

  return {
    showApiForm,
    newApiName,
    newApiKey,
    setShowApiForm,
    setNewApiName,
    setNewApiKey,
    handleAddNewApi
  };
}

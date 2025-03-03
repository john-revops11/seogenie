
import { ApiStatusState } from "../types";

export const saveApiStates = (newStates: ApiStatusState): void => {
  try {
    const enabledStates = Object.keys(newStates).reduce((acc, key) => {
      acc[key] = newStates[key].enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('apiEnabledStates', JSON.stringify(enabledStates));
  } catch (error) {
    console.error("Error saving API states:", error);
  }
};

export const loadApiStates = (
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>
): void => {
  try {
    const savedStates = localStorage.getItem('apiEnabledStates');
    if (savedStates) {
      const enabledStates = JSON.parse(savedStates) as Record<string, boolean>;
      
      setApiStatus(prev => {
        const newStates = { ...prev };
        Object.keys(enabledStates).forEach(key => {
          if (newStates[key]) {
            newStates[key] = {
              ...newStates[key],
              enabled: enabledStates[key],
              status: enabledStates[key] ? newStates[key].status : "disconnected" as const
            };
          }
        });
        return newStates;
      });
    }
  } catch (error) {
    console.error("Error loading API states:", error);
  }
};

export const saveSelectedModel = (model: string): void => {
  try {
    localStorage.setItem('selectedAiModel', model);
  } catch (error) {
    console.error("Error saving selected model:", error);
  }
};

export const loadSelectedModel = (
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>
): void => {
  try {
    const savedModel = localStorage.getItem('selectedAiModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  } catch (error) {
    console.error("Error loading selected model:", error);
  }
};

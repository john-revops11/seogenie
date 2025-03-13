
import React from "react";
import { Label } from "@/components/ui/label";
import { WORD_COUNT_OPTIONS } from "../WordCountSelector";

interface WordCountDropdownProps {
  wordCountOption: string;
  onWordCountOptionChange: (option: string) => void;
}

const WordCountDropdown: React.FC<WordCountDropdownProps> = ({
  wordCountOption,
  onWordCountOptionChange,
}) => {
  return (
    <div className="space-y-2">
      <Label>Word Count</Label>
      <select 
        className="w-full p-2 border rounded-md"
        value={wordCountOption}
        onChange={(e) => onWordCountOptionChange(e.target.value)}
      >
        {WORD_COUNT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WordCountDropdown;

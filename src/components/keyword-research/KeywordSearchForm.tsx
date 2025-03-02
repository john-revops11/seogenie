
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KeywordSearchFormProps {
  onSearch: (searchTerm: string) => Promise<void>;
  isSearching: boolean;
}

const KeywordSearchForm = ({ onSearch, isSearching }: KeywordSearchFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }
    
    await onSearch(searchTerm);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Enter a topic or keyword..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Button 
        onClick={handleSearch} 
        disabled={isSearching}
        className="bg-revology hover:bg-revology-dark"
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Researching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Research
          </>
        )}
      </Button>
    </div>
  );
};

export default KeywordSearchForm;

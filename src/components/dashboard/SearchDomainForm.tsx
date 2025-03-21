
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchDomainFormProps {
  searchDomain: string;
  setSearchDomain: (domain: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  domain: string;
  apiCallsMade: boolean;
  refetch: () => void;
}

export function SearchDomainForm({
  searchDomain,
  setSearchDomain,
  handleSubmit,
  isLoading,
  domain,
  apiCallsMade,
  refetch
}: SearchDomainFormProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <Input 
        placeholder="Enter domain (e.g., example.com)" 
        value={searchDomain}
        onChange={(e) => setSearchDomain(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        <Search className="h-4 w-4 mr-2" />
        Analyze
      </Button>
      {domain && apiCallsMade && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </form>
  );
}

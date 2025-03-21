
import { ExternalLink } from 'lucide-react';

interface RankingLinkProps {
  url?: string;
  position?: number;
}

const RankingLink = ({ url, position }: RankingLinkProps) => {
  // No ranking information
  if (!url && !position) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  // Only position information, no URL
  if (!url && position) {
    return <span>#{position}</span>;
  }
  
  // Ensure URL starts with http:// or https://
  const fullUrl = url?.startsWith('http') ? url : `https://${url}`;
  
  return (
    <a 
      href={fullUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center text-blue-600 hover:text-blue-800"
    >
      <span className="mr-1">#{position || 'N/A'}</span>
      <ExternalLink size={14} />
    </a>
  );
};

export default RankingLink;

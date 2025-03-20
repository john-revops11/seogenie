
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
  
  // Get a cleaner URL display by removing http/https and trailing slashes
  const displayUrl = url?.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  
  return (
    <a 
      href={fullUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center text-blue-600 hover:text-blue-800"
      title={fullUrl}
    >
      <span className="mr-1">#{position || 'N/A'}</span>
      <span className="truncate max-w-[120px]">{displayUrl}</span>
      <ExternalLink size={14} className="ml-1 flex-shrink-0" />
    </a>
  );
};

export default RankingLink;

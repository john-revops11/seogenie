
import { Badge } from "@/components/ui/badge";
import { IntersectionKeyword } from "@/hooks/useDomainIntersection";

export function getCompetitionLevelColor(level: string) {
  switch (level.toUpperCase()) {
    case 'HIGH': return "bg-red-100 text-red-800";
    case 'MEDIUM': return "bg-yellow-100 text-yellow-800";
    case 'LOW': return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function getPositionDifference(pos1: number, pos2: number) {
  if (pos1 === 0 || pos2 === 0) return null;
  return pos1 - pos2;
}

export function KeywordBadges({ keyword }: { keyword: IntersectionKeyword }) {
  return (
    <>
      {keyword.is_featured_snippet && (
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          Featured
        </Badge>
      )}
      {keyword.keyword_difficulty > 6 && (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Difficult
        </Badge>
      )}
    </>
  );
}

export function PositionDifferenceBadge({ keyword }: { keyword: IntersectionKeyword }) {
  const positionDiff = getPositionDifference(keyword.target1_position, keyword.target2_position);
  const isWinning = positionDiff !== null && positionDiff < 0;
  const isLosing = positionDiff !== null && positionDiff > 0;

  if (positionDiff === null) return <span>-</span>;

  return (
    <Badge variant={isWinning ? "secondary" : isLosing ? "destructive" : "outline"}>
      {isWinning ? "+" : ""}{Math.abs(positionDiff)}
    </Badge>
  );
}


import { Skeleton } from "@/components/ui/skeleton";

interface IntersectionLoadingProps {
  targetDomain: string;
  competitorDomain: string;
}

export function IntersectionLoading({ targetDomain, competitorDomain }: IntersectionLoadingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full animate-spin" />
        <p>Analyzing intersection between {targetDomain} and {competitorDomain}...</p>
      </div>
      {Array(5).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

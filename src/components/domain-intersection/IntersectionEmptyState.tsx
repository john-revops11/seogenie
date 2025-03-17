
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IntersectionEmptyState() {
  return (
    <Alert>
      <AlertDescription>
        Enter your domain and a competitor domain, then click "Compare Domains" to find common keywords and ranking positions.
      </AlertDescription>
    </Alert>
  );
}

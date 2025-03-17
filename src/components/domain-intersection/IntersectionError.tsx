
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntersectionErrorProps {
  error: string;
}

export function IntersectionError({ error }: IntersectionErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

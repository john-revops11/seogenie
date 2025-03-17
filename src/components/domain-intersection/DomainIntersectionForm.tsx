
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DomainIntersectionFormProps {
  targetDomain: string;
  competitorDomain: string;
  setTargetDomain: (domain: string) => void;
  setCompetitorDomain: (domain: string) => void;
  handleCompare: () => void;
  isLoading: boolean;
  resetData: () => void;
  intersectionDataExists: boolean;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  confirmAnalysis: () => void;
}

export function DomainIntersectionForm({
  targetDomain,
  competitorDomain,
  setTargetDomain,
  setCompetitorDomain,
  handleCompare,
  isLoading,
  resetData,
  intersectionDataExists,
  openDialog,
  setOpenDialog,
  confirmAnalysis,
}: DomainIntersectionFormProps) {
  const handleCompareClick = () => {
    if (targetDomain && competitorDomain) {
      handleCompare();
    } else {
      if (!targetDomain) {
        toast.error("Please enter a target domain");
      } else {
        toast.error("Please enter a competitor domain");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow space-y-2">
          <label className="text-sm font-medium">Your Domain</label>
          <Input 
            placeholder="yourdomain.com" 
            value={targetDomain}
            onChange={(e) => setTargetDomain(e.target.value)}
          />
        </div>
        <div className="flex-grow space-y-2">
          <label className="text-sm font-medium">Competitor Domain</label>
          <Input 
            placeholder="competitor.com" 
            value={competitorDomain}
            onChange={(e) => setCompetitorDomain(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          onClick={handleCompareClick} 
          disabled={isLoading || !targetDomain || !competitorDomain}
          className="whitespace-nowrap"
        >
          Compare Domains
        </Button>
        
        {intersectionDataExists && (
          <Button 
            variant="outline" 
            onClick={resetData}
            disabled={isLoading}
          >
            Reset
          </Button>
        )}
      </div>
      
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm API Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will make an API call to DataForSEO to analyze common keywords between {targetDomain} and {competitorDomain}.
              Each request counts against your API quota. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAnalysis}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

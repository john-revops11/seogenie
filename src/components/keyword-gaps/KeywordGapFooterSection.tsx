
import { CardFooter } from "@/components/ui/card";
import KeywordGapPagination from "./KeywordGapPagination";
import { toast } from "sonner";

interface KeywordGapFooterSectionProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalKeywords: number;
  itemsPerPage: number;
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange: (value: number) => void;
  shouldShowFooter: boolean;
}

export function KeywordGapFooterSection({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalKeywords,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  shouldShowFooter
}: KeywordGapFooterSectionProps) {
  if (!shouldShowFooter) return null;
  
  return (
    <CardFooter className="flex-col sm:flex-row">
      <KeywordGapPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalKeywords={totalKeywords}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        onAddMoreKeywords={() => {
          const newItemsPerPage = itemsPerPage + 15;
          onItemsPerPageChange(newItemsPerPage);
          toast.success("Added more keywords to the list");
        }}
      />
    </CardFooter>
  );
}

export default KeywordGapFooterSection;

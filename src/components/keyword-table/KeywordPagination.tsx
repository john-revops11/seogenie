
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "./types";

const KeywordPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  isLoading
}) => {
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
      <div className="text-xs text-muted-foreground">
        Showing {totalItems > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} keywords
      </div>
      
      <div className="flex items-center gap-4">
        <Select 
          value={rowsPerPage.toString()} 
          onValueChange={(value) => onRowsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeywordPagination;

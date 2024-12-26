import React from "react";

interface PaginationProps {
  totalItems?: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  totalItems ??= 100; // Default to 100 if totalItems is not provided

  // Calculate total pages based on total items and items per page
  const totalPages: number = Math.ceil(totalItems / itemsPerPage);

  // Calculate the pages to display
  const getPaginationPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    // Always show 1 and 2
    pages.push(1);
    if (totalPages > 1) pages.push(2);

    // Add the middle pages: the current page and its neighbors
    if (currentPage > 2 && currentPage < totalPages - 1) {
      // Add previous and next pages around the current one
      pages.push(currentPage - 1); // Previous page
      pages.push(currentPage); // Current page
      pages.push(currentPage + 1); // Next page
    }

    // Add ellipsis if there is a gap between pages
    if (currentPage < totalPages - 2 && totalPages > 5) {
      pages.push("...");
    }

    // Always show the near last and last page
    if (totalPages > 2) {
      if (currentPage < totalPages - 2) pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="join">
      {getPaginationPages().map((page, index) => (
        <button
          key={index}
          className={`join-item btn ${
            page === currentPage ? "btn-disabled" : ""
          }`}
          onClick={() => {
            if (typeof page === "number") {
              onPageChange(page); // Use the callback function passed from the parent
            }
          }}
        >
          {page === "..." ? (
            <span className="text-gray-500">...</span> // Display ellipsis with styling
          ) : (
            page
          )}
        </button>
      ))}
    </div>
  );
};

export default Pagination;

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination__info tabular">
        {start}–{end} of {total}
      </span>
      <div className="pagination__controls">
        <button className="pagination__btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="pagination__page tabular">
          {page} / {totalPages}
        </span>
        <button
          className="pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

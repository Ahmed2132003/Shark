export default function OrdersPagination({ page, total, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="orders-pagination">
      <p className="orders-pagination__summary">Page {page} of {totalPages} ({total} orders)</p>
      <div className="orders-pagination__actions">        
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="orders-btn"          
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="orders-btn"          
        >
          Next
        </button>
      </div>
    </div>
  );
}
export default function OrderDetailsSkeleton() {
  return (
    <div className="orders-skeleton" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="orders-skeleton-row" />        
      ))}
    </div>
  );
}
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../../components/dashboard/StatsCard';
import { getDashboardOverview } from '../../services/dashboardService';
import './dashboard.css';

function StatsCardSkeleton() {
  return (
    <article className="stats-card stats-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-value" />
      <div className="skeleton skeleton-change" />
    </article>
  );
}

export default function Dashboard() {
  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => getDashboardOverview(),
    retry: 1,
  });

  return (
    <section className="admin-dashboard-overview">
      <header className="admin-dashboard-overview__header">
        <h1>Dashboard Overview</h1>
        <p>Live admin snapshot for sales, orders, customers, and catalog performance.</p>
      </header>

      {isLoading && (
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="dashboard-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>
          <button type="button" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && overview && (
        <div className="stats-grid">
          {overview.stats.map((stat) => (
            <StatsCard key={stat.key} {...stat} icon={stat.key} />
          ))}
        </div>
      )}
    </section>
  );
}
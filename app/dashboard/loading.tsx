export default function DashboardLoading() {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="Loading your workspace">
      <div className="skeleton" />
      <div className="skeleton-row">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <div className="skeleton tall" />
    </div>
  );
}

/**
 * Route-level loading states.
 *
 * Each one traces the shape of the page it stands in for, so navigating never
 * shows a blank frame and never shifts the layout when the data lands.
 */
export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return <div className="skeleton-grid" aria-busy="true" aria-label="Loading">{children}</div>;
}

export function SkeletonRow({ count = 4, tall = false }: { count?: number; tall?: boolean }) {
  return (
    <div className="skeleton-row">
      {Array.from({ length: count }, (_, index) => <div className={tall ? "skeleton tall" : "skeleton"} key={index} />)}
    </div>
  );
}

export function SkeletonBar({ tall = false }: { tall?: boolean }) {
  return <div className={tall ? "skeleton tall" : "skeleton"} />;
}

/** Toolbar over a card grid: menu, gallery, and the content collections. */
export function SkeletonGridPage({ columns = 3 }: { columns?: number }) {
  return (
    <SkeletonPage>
      <div className="skeleton short" />
      <SkeletonRow count={columns} tall />
      <SkeletonRow count={columns} tall />
    </SkeletonPage>
  );
}

/** A sidebar beside one wide panel: settings, website, and design. */
export function SkeletonSplitPage() {
  return (
    <SkeletonPage>
      <div className="skeleton-split">
        <div className="skeleton tall" />
        <div className="skeleton tall" />
      </div>
    </SkeletonPage>
  );
}

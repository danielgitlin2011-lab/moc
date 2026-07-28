import { SkeletonBar, SkeletonPage, SkeletonRow } from "@/components/skeletons";

export default function LeadsLoading() {
  return (
    <SkeletonPage>
      <SkeletonBar />
      <div className="skeleton short" />
      <SkeletonRow count={5} tall />
    </SkeletonPage>
  );
}

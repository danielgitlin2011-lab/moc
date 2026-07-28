import { SkeletonPage } from "@/components/skeletons";

export default function PreviewLoading() {
  return (
    <SkeletonPage>
      <div className="skeleton short" />
      <div className="skeleton tall" style={{ minHeight: "60vh" }} />
    </SkeletonPage>
  );
}

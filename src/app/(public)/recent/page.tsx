import { Suspense } from "react";
import RecentPageInner from "./recent-page-inner";

export default function RecentPage() {
  return (
    <Suspense fallback={null}>
      <RecentPageInner />
    </Suspense>
  );
}
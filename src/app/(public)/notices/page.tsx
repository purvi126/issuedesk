import { Suspense } from "react";
import NoticesPageInner from "./notices-page-inner";

export default function NoticesPage() {
  return (
    <Suspense fallback={null}>
      <NoticesPageInner />
    </Suspense>
  );
}
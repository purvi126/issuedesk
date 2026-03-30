import { Suspense } from "react";
import IssuesPageInner from "./issues-page-inner";

export default function IssuesPage() {
  return (
    <Suspense fallback={null}>
      <IssuesPageInner />
    </Suspense>
  );
}
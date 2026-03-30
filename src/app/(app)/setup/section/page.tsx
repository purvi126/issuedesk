import { Suspense } from "react";
import SectionPageInner from "./section-page-inner";

export default function SetupSectionPage() {
  return (
    <Suspense>
      <SectionPageInner />
    </Suspense>
  );
}
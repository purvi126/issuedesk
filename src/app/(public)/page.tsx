import { Suspense } from "react";
import LandingPageInner from "./landing-page-inner";

export default function PublicLandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingPageInner />
    </Suspense>
  );
}
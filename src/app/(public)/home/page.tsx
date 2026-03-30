import { Suspense } from "react";
import HomePageInner from "./home-page-inner";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
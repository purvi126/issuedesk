import { Suspense } from "react";
import LocationPageInner from "./location-page-inner";

export default function LocationPage() {
  return (
    <Suspense fallback={null}>
      <LocationPageInner />
    </Suspense>
  );
}
import { Suspense } from "react";
import RolePageInner from "./role-page-inner";

export default function RolePage() {
  return (
    <Suspense fallback={null}>
      <RolePageInner />
    </Suspense>
  );
}
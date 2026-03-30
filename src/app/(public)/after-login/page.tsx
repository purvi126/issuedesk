import { Suspense } from "react";
import AfterLoginPageInner from "./after-login-page-inner";

export default function AfterLoginPage() {
  return (
    <Suspense fallback={null}>
      <AfterLoginPageInner />
    </Suspense>
  );
}
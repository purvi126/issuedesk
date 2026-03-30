import { Suspense } from "react";
import LoginPageInner from "./login-page-inner";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
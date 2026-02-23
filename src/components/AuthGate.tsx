import LoginButton from "@/components/LoginButton";

export default function AuthGate({
  title = "Sign in required",
  message = "Please sign in to continue.",
  fallbackTo,
}: {
  title?: string;
  message?: string;
  fallbackTo?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>

        <div className="mt-5">
          <LoginButton label="Sign in to continue" fallbackTo={fallbackTo} />
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          You’ll come back here after signing in.
        </p>
      </div>
    </main>
  );
}
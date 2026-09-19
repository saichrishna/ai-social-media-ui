export function SetupError() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-3 p-8">
      <h1 className="text-xl font-semibold">User setup required</h1>
      <p className="text-[color:var(--text-muted)]">
        Set <code className="font-mono text-sm">AUTH_BOOTSTRAP_USER_ID</code> to
        an existing user id from the backend. This app does not include a login
        screen.
      </p>
    </main>
  );
}

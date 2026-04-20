export default function Home() {
  return (
    <main className="min-h-screen bg-bg-base p-12">
      <h1
        className="font-display text-display-xl font-bold text-text-primary"
      >
        PURDYGOOD
      </h1>
      <p className="mt-4 font-body text-body text-text-secondary prose-width">
        Motion design (the kind that moves people, not just pixels). Based in
        Brooklyn (by way of wherever).
      </p>
      <p className="mt-4 font-mono text-mono text-text-secondary">
        02a — Explainer Videos
      </p>
      <div className="mt-8 rounded-card bg-bg-surface p-8">
        <p className="text-text-primary">Card surface</p>
      </div>
      <div className="mt-4 flex gap-3">
        <span className="rounded-full bg-accent-orange px-3 py-1 text-sm text-white">Orange</span>
        <span className="rounded-full bg-accent-purple px-3 py-1 text-sm text-white">Purple</span>
        <span className="rounded-full bg-accent-green px-3 py-1 text-sm text-white">Green</span>
        <span className="rounded-full bg-accent-pink px-3 py-1 text-sm text-white">Pink</span>
        <span className="rounded-full bg-accent-blue px-3 py-1 text-sm text-white">Blue</span>
      </div>
    </main>
  );
}

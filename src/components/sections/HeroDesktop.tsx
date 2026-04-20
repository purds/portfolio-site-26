export function HeroDesktop() {
  return (
    <div className="relative flex min-h-screen flex-col items-start justify-center px-16">
      {/* Grid canvas will be layered here in Task 14 */}
      <h1 className="relative z-10 font-display text-display-xl font-bold leading-none tracking-tight">
        PURDYGOOD
      </h1>
      <p className="relative z-10 mt-6 text-body text-text-secondary prose-width">
        Motion designer who thinks in systems and moves in stories.
      </p>
      <div className="relative z-10 mt-12 font-mono text-mono text-text-secondary">
        (scroll)
      </div>
    </div>
  );
}

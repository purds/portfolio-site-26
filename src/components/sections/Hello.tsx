const clients = [
  "Google",
  "IBM",
  "VICE",
  "T-Mobile",
  "D&AD",
  "BESE",
  "Propel",
];

export function Hello() {
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-16">
      <div>
        <h2 className="font-display text-display font-bold leading-tight">
          Motion design that moves people, not just pixels.
        </h2>
        <div className="prose-width mt-8 space-y-6 text-body text-text-secondary">
          <p>
            Based in Brooklyn (by way of everywhere). I make things move with
            purpose — explainer videos, brand films, editorial animation,
            product demos, and the occasional VJ set.
          </p>
          <p>
            Currently seeking full-time and freelance opportunities
            (preferably with people who care about craft).
          </p>
        </div>
      </div>
      <div className="flex items-end">
        <div>
          <span className="font-mono text-mono uppercase tracking-wider text-text-secondary">
            (Selected clients)
          </span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {clients.map((client) => (
              <li
                key={client}
                className="rounded-full bg-bg-surface px-4 py-1.5 text-sm text-text-primary"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

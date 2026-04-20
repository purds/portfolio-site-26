const links = [
  { label: "Email", action: "talk", href: "mailto:james@purdygood.me" },
  { label: "LinkedIn", action: "connect", href: "https://linkedin.com/in/jamespurdy" },
  { label: "Vimeo", action: "watch", href: "https://vimeo.com/purdygood" },
  { label: "GitHub", action: "build", href: "https://github.com/purdygoo" },
];

export function Contact() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-start px-6 py-24 lg:px-16">
      <h2 className="font-display text-display font-bold">Say hello.</h2>

      <p className="mt-6 text-body text-text-secondary">
        Currently available for motion design roles and select freelance
        projects.
      </p>

      <div className="mt-12 flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            className="rounded-full bg-bg-surface px-6 py-3 text-body font-medium text-text-primary transition-colors hover:bg-bg-surface-raised"
          >
            {link.label}{" "}
            <span className="text-text-secondary">({link.action})</span>
          </a>
        ))}
      </div>
    </div>
  );
}

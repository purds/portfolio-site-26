import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PURDYGOOD — James Purdy, Motion Designer",
  description:
    "Portfolio of James Purdy, a motion designer based in Brooklyn, NY. Clients include Google, IBM, VICE, T-Mobile, D&AD, BESE, and Propel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

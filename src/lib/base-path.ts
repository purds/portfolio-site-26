const basePath = process.env.NODE_ENV === "production" ? "/portfolio-site-26" : "";

export function assetPath(path: string): string {
  return `${basePath}${path}`;
}

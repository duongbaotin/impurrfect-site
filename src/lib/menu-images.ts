// Shared lookup for drink thumbnails. Menu YAML/Baserow store a basename
// (e.g. "/margarita.webp"); Vite turns each asset into a hashed URL.
const imageModules = import.meta.glob('../assets/images/*.{webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const menuImageSrcMap: Record<string, string> = {};

for (const [path, src] of Object.entries(imageModules)) {
  const filename = '/' + path.split('/').pop()!;
  menuImageSrcMap[filename] = src;
}

export function resolveMenuImage(image?: string): string | undefined {
  return image ? menuImageSrcMap[image] : undefined;
}

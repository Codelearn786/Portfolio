const YT_PATTERNS: RegExp[] = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
];

export function parseYoutubeId(input: string): string | null {
  for (const pattern of YT_PATTERNS) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  return null;
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1'
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

import type { AppContext } from "../_lib/cloudflare";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type OGPContext = AppContext<{
  ASSETS: AssetsBinding;
}>;

function toBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export async function onRequestGet(context: OGPContext) {
  const assetUrl = new URL("/daha-sengen-main-visual.png?v=20260330", context.request.url);
  const imageResponse = await context.env.ASSETS.fetch(new Request(assetUrl.toString()));
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = toBase64(imageBuffer);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="打破宣言メーカーの共有画像">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8f4e8" />
          <stop offset="55%" stop-color="#f3ecdb" />
          <stop offset="100%" stop-color="#eae1ca" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stop-color="#d7e7a9" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#d7e7a9" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="630" rx="36" fill="url(#bg)" />
      <rect x="28" y="28" width="1144" height="574" rx="30" fill="none" stroke="#d7c8a3" stroke-opacity="0.85" />
      <circle cx="620" cy="318" r="210" fill="url(#glow)" />
      <rect x="92" y="108" width="360" height="414" rx="28" fill="#faf7ef" stroke="#d7c8a3" />
      <rect x="112" y="128" width="320" height="374" rx="22" fill="#ffffff" fill-opacity="0.9" stroke="#e2d7b9" />
      <image href="data:image/png;base64,${imageBase64}" x="112" y="128" width="320" height="374" preserveAspectRatio="xMidYMid slice" />
      <text x="520" y="214" fill="#285434" font-size="34" font-family="'Noto Sans JP', sans-serif" font-weight="700" letter-spacing="0.08em">日本の閉塞感を打破する</text>
      <text x="520" y="294" fill="#15253b" font-size="64" font-family="'Shippori Mincho', serif" font-weight="800">打破宣言しよう！</text>
      <text x="520" y="370" fill="#4f5a5b" font-size="28" font-family="'Noto Sans JP', sans-serif">歴史上の人物になぞらえて、</text>
      <text x="520" y="416" fill="#4f5a5b" font-size="28" font-family="'Noto Sans JP', sans-serif">新卒としての活躍宣言をつくろう。</text>
      <rect x="520" y="464" width="272" height="58" rx="29" fill="#2d8c3c" />
      <text x="656" y="503" text-anchor="middle" fill="#ffffff" font-size="28" font-family="'Noto Sans JP', sans-serif" font-weight="700">打破宣言メーカー</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

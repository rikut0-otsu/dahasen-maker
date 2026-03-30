import type { AppContext } from "../_lib/cloudflare";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type TypePageContext = AppContext<{
  ASSETS: AssetsBinding;
}>;

const defaultTitle = "打破宣言メーカー | 活躍宣言をつくろう";
const defaultDescription =
  "日本の閉塞感を打破する。歴史上の人物になぞらえながら、新卒としての活躍宣言をつくる診断サイトです。";
const defaultImageUrl = "/site_ogp.png?v=20260330";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function buildMetaTags(requestUrl: URL) {
  const shareNameRaw = requestUrl.searchParams.get("shareName")?.trim() ?? "";
  const shareName = shareNameRaw.slice(0, 50);
  const title = shareName
    ? `${shareName}さんが打破宣言しました！ | 打破宣言メーカー`
    : defaultTitle;
  const description = shareName
    ? `${shareName}さんが打破宣言しました！登録して診断結果を確認しよう！`
    : defaultDescription;
  const imageUrl = new URL(defaultImageUrl, requestUrl.origin).toString();

  return {
    title,
    description,
    url: requestUrl.toString(),
    imageUrl,
  };
}

function injectMetadata(html: string, metadata: ReturnType<typeof buildMetaTags>) {
  const title = escapeHtml(metadata.title);
  const description = escapeAttribute(metadata.description);
  const url = escapeAttribute(metadata.url);
  const imageUrl = escapeAttribute(metadata.imageUrl);

  const sanitizedHtml = html
    .replace(/<title>.*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[\s\S]*?\/>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/>\s*/gi, "");

  const tags = `    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="打破宣言メーカー" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="266" />
    <meta property="og:image:alt" content="打破宣言メーカーの共有画像" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="打破宣言メーカーの共有画像" />
`;

  return sanitizedHtml.replace(/<head>/i, `<head>\n${tags}`);
}

export async function onRequestGet(context: TypePageContext) {
  const requestUrl = new URL(context.request.url);
  const assetUrl = new URL("/index.html", requestUrl.origin);
  const assetResponse = await context.env.ASSETS.fetch(new Request(assetUrl.toString()));
  const html = await assetResponse.text();
  const metadata = buildMetaTags(requestUrl);

  return new Response(injectMetadata(html, metadata), {
    status: assetResponse.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}

import type { AppContext } from "./_lib/cloudflare";
import typesData from "../client/src/data/types.json";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type PageContext = AppContext<{
  ASSETS: AssetsBinding;
}>;

type TypeSummary = {
  id: string;
  name: string;
  title?: string;
  eraLabel?: string;
  eraTheme?: string;
  imagePath?: string;
};

const defaultMetadata = {
  title: "打破宣言メーカー | 活躍宣言をつくろう",
  description:
    "日本の閉塞感を打破する。歴史上の人物になぞらえながら、新卒としての活躍宣言をつくる診断サイトです。",
  imagePath: "/daha-sengen-main-visual.png",
};

const allTypes = typesData as TypeSummary[];

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

function buildMetadata(url: URL) {
  const typeIdMatch = url.pathname.match(/^\/types\/([^/]+)$/);
  const typeId = typeIdMatch?.[1];
  const shareName = url.searchParams.get("shareName")?.trim() ?? "";

  if (!typeId) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      imageUrl: new URL(defaultMetadata.imagePath, url.origin).toString(),
      url: url.toString(),
    };
  }

  const type = allTypes.find((item) => item.id === typeId);
  if (!type) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      imageUrl: new URL(defaultMetadata.imagePath, url.origin).toString(),
      url: url.toString(),
    };
  }

  const headline = shareName
    ? `${shareName}さんが打破宣言しました！`
    : `${type.name}タイプの打破宣言`;
  const detailLabel = [type.eraLabel, type.eraTheme, type.title]
    .filter(Boolean)
    .join(" / ");
  const description = shareName
    ? `${shareName}さんの診断結果は「${type.name}」。ログインして結果を見てみよう！`
    : `診断結果は「${type.name}」でした。${detailLabel}の人物像をチェックしてみよう！`;

  return {
    title: `${headline} | 打破宣言メーカー`,
    description,
    imageUrl: new URL(type.imagePath ?? defaultMetadata.imagePath, url.origin).toString(),
    url: url.toString(),
  };
}

function injectMetadata(html: string, metadata: ReturnType<typeof buildMetadata>) {
  const title = escapeHtml(metadata.title);
  const description = escapeAttribute(metadata.description);
  const imageUrl = escapeAttribute(metadata.imageUrl);
  const url = escapeAttribute(metadata.url);

  const replacement = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="打破宣言メーカー" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  return html
    .replace(/<title>.*?<\/title>/i, "<title></title>")
    .replace(/<meta[^>]+name="description"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace("<title></title>", replacement);
}

export async function onRequestGet(context: PageContext) {
  const response = await context.env.ASSETS.fetch(context.request);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const metadata = buildMetadata(new URL(context.request.url));
  const nextHtml = injectMetadata(html, metadata);
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(nextHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

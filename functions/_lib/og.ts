import type { AppContext } from "./cloudflare";
import typesData from "../../client/src/data/types.json";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

export type OGPContext = AppContext<{
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

function buildTypeMetadata(url: URL) {
  const typeIdMatch = url.pathname.match(/^\/types\/([^/]+)$/);
  const typeId = typeIdMatch?.[1];
  const shareName = url.searchParams.get("shareName")?.trim() ?? "";

  if (!typeId) {
    return null;
  }

  const type = allTypes.find((item) => item.id === typeId);
  if (!type) {
    return null;
  }

  const headline = shareName
    ? `${shareName}さんが打破宣言しました！`
    : `${type.name}タイプの打破宣言`;
  const detailLabel = [type.eraLabel, type.eraTheme, type.title].filter(Boolean).join(" / ");
  const description = shareName
    ? `${shareName}さんの診断結果は「${type.name}」。ログインして結果を見てみよう！`
    : `診断結果は「${type.name}」でした。${detailLabel}の人物像をチェックしてみよう！`;
  const imageUrl = new URL(type.imagePath ?? "/og-default.png", url.origin).toString();

  return {
    title: `${headline} | 打破宣言メーカー`,
    description,
    imageUrl,
    url: url.toString(),
  };
}

function injectMetadata(html: string, metadata: NonNullable<ReturnType<typeof buildTypeMetadata>>) {
  const title = escapeHtml(metadata.title);
  const description = escapeAttribute(metadata.description);
  const imageUrl = escapeAttribute(metadata.imageUrl);
  const url = escapeAttribute(metadata.url);
  const imageAlt = escapeAttribute(`${metadata.title}の共有画像`);

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
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
  `;

  return html
    .replace(/<title>.*?<\/title>/i, "<title></title>")
    .replace(/<meta[^>]+name="description"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace("<title></title>", replacement);
}

export async function renderTypePageWithMetadata(context: OGPContext) {
  const metadata = buildTypeMetadata(new URL(context.request.url));
  if (!metadata) {
    return context.env.ASSETS.fetch(context.request);
  }

  const htmlResponse = await context.env.ASSETS.fetch(
    new Request(new URL("/index.html", context.request.url).toString(), {
      headers: context.request.headers,
    })
  );

  const html = await htmlResponse.text();
  const nextHtml = injectMetadata(html, metadata);
  const headers = new Headers(htmlResponse.headers);
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(nextHtml, {
    status: htmlResponse.status,
    statusText: htmlResponse.statusText,
    headers,
  });
}

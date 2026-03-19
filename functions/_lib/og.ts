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

const defaultMetadata = {
  title: "打破宣言しよう！ | 打破宣言メーカー",
  description:
    "日本の閉塞感を打破する。歴史上の人物になぞらえながら、新卒としての活躍宣言をつくろう。",
  imagePath: "/og/default.svg",
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
    <meta property="og:image:alt" content="打破宣言メーカーの共有画像" />
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

export async function renderPageWithMetadata(context: OGPContext) {
  const htmlResponse = await context.env.ASSETS.fetch(
    new Request(new URL("/index.html", context.request.url).toString(), {
      headers: context.request.headers,
    })
  );
  const html = await htmlResponse.text();
  const metadata = buildMetadata(new URL(context.request.url));
  const nextHtml = injectMetadata(html, metadata);
  const headers = new Headers(htmlResponse.headers);
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(nextHtml, {
    status: htmlResponse.status,
    statusText: htmlResponse.statusText,
    headers,
  });
}

import { renderPageWithMetadata, type OGPContext } from "./_lib/og";

const staticAssetPrefixes = ["/assets/", "/type-images/", "/api/"];
const staticAssetExactPaths = ["/daha-sengen-main-visual.png", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

function isStaticAsset(pathname: string) {
  if (staticAssetPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  if (staticAssetExactPaths.includes(pathname)) {
    return true;
  }

  return /\.[a-z0-9]+$/i.test(pathname);
}

export async function onRequestGet(context: OGPContext) {
  const url = new URL(context.request.url);

  if (isStaticAsset(url.pathname)) {
    return context.env.ASSETS.fetch(context.request);
  }

  return renderPageWithMetadata(context);
}

export async function onRequestHead(context: OGPContext) {
  const url = new URL(context.request.url);

  if (isStaticAsset(url.pathname)) {
    return context.env.ASSETS.fetch(context.request);
  }

  return renderPageWithMetadata(context);
}

import { renderPageWithMetadata, type OGPContext } from "./_lib/og";

export async function onRequestGet(context: OGPContext) {
  return renderPageWithMetadata(context);
}

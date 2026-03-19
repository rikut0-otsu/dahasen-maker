import { renderTypePageWithMetadata, type OGPContext } from "../_lib/og";

export async function onRequestGet(context: OGPContext) {
  return renderTypePageWithMetadata(context);
}

export async function onRequestHead(context: OGPContext) {
  return renderTypePageWithMetadata(context);
}

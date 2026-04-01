import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
  imagePath: "/site_ogp.png?v=20260330",
  imageWidth: 512,
  imageHeight: 266,
};

function getImageDimensions(imagePath: string) {
  if (imagePath.startsWith("/type-images/")) {
    return {
      width: 332,
      height: 512,
    };
  }

  return {
    width: defaultMetadata.imageWidth,
    height: defaultMetadata.imageHeight,
  };
}

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

function loadTypes(): TypeSummary[] {
  const candidates = [
    path.resolve(__dirname, "..", "client", "src", "data", "types.json"),
    path.resolve(process.cwd(), "client", "src", "data", "types.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, "utf8")) as TypeSummary[];
    }
  }

  return [];
}

const types = loadTypes();

function getOrigin(req: express.Request) {
  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader?.split(",")[0];
  const protocol = forwardedProto ?? req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function buildMetadata(req: express.Request) {
  const origin = getOrigin(req);
  const currentUrl = `${origin}${req.originalUrl}`;
  const typeIdMatch = req.path.match(/^\/types\/([^/]+)$/);
  const typeId = typeIdMatch?.[1];
  const shareNameRaw = req.query.shareName;
  const shareName = typeof shareNameRaw === "string" ? shareNameRaw.trim() : "";

  if (!typeId) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      imageUrl: `${origin}${defaultMetadata.imagePath}`,
      imageWidth: defaultMetadata.imageWidth,
      imageHeight: defaultMetadata.imageHeight,
      url: currentUrl,
    };
  }

  const type = types.find((item) => item.id === typeId);
  if (!type) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      imageUrl: `${origin}${defaultMetadata.imagePath}`,
      imageWidth: defaultMetadata.imageWidth,
      imageHeight: defaultMetadata.imageHeight,
      url: currentUrl,
    };
  }

  const headline = shareName
    ? `${shareName}さんが打破宣言しました！`
    : `${type.name}タイプの打破宣言`;
  const detailLabel = [type.eraLabel, type.eraTheme, type.title].filter(Boolean).join(" / ");
  const description = shareName
    ? `${shareName}さんの診断結果は「${type.name}」。ログインして結果を見てみよう！`
    : `診断結果は「${type.name}」でした。${detailLabel}の人物像をチェックしてみよう！`;

  const imagePath = type.imagePath ?? defaultMetadata.imagePath;
  const imageDimensions = getImageDimensions(imagePath);

  return {
    title: `${headline} | 打破宣言メーカー`,
    description,
    imageUrl: `${origin}${imagePath}`,
    imageWidth: imageDimensions.width,
    imageHeight: imageDimensions.height,
    url: currentUrl,
  };
}

function injectMetadata(html: string, metadata: ReturnType<typeof buildMetadata>) {
  const title = escapeHtml(metadata.title);
  const description = escapeAttribute(metadata.description);
  const imageUrl = escapeAttribute(metadata.imageUrl);
  const imageWidth = String(metadata.imageWidth);
  const imageHeight = String(metadata.imageHeight);
  const url = escapeAttribute(metadata.url);

  const tags = `
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="打破宣言メーカー" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="${imageWidth}" />
    <meta property="og:image:height" content="${imageHeight}" />
    <meta property="og:locale" content="ja_JP" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  return html
    .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
    .replace(
      "</head>",
      `  <meta name="description" content="${description}" />\n${tags}\n  </head>`
    );
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");
  const indexHtmlPath = path.join(staticPath, "index.html");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (req, res) => {
    const html = fs.readFileSync(indexHtmlPath, "utf8");
    const metadata = buildMetadata(req);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(injectMetadata(html, metadata));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

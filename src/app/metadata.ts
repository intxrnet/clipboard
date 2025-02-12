import content from "./components/content.json";

const SUB = content.name;

// Base URL construction based on environment
const BASE_URL = `https://${SUB}.intxr.net`;

// Construct site metadata object
export const siteMetadata = {
  title: SUB,
  description:
    `Free, Open-Source, Private, Client-Side ${SUB} Tools. Made with love and kindness by makers of its-ours.org`.replace(
      /\b\w/g,
      (l) => l.toUpperCase()
    ),
  author: "Bhargav Kantheti",
  authorUrl: "https://bhargavkantheti.com",
  siteUrl: BASE_URL,
  siteName: SUB,
  siteRepo: `https://github.com/intxrnet/${SUB}`,
  socialBanner: `${BASE_URL}/og.svg`,
};

// Generate keywords from content descriptions
export const keywords = (() => {
  // Get all descriptions from content items
  const descriptions = Object.values(content).flatMap((item) =>
    typeof item === "object" && "description" in item ? item.description : []
  );

  // Split descriptions into words, convert to lowercase, and remove duplicates
  const uniqueWords = [
    ...new Set(
      descriptions
        .join(" ")
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 2) // Filter out small words
        .map((word) => word.replace(/[^a-z0-9]/g, "")) // Remove special characters
        .filter(Boolean) // Remove empty strings
    ),
  ];

  return uniqueWords;
})();

// Construct OpenGraph metadata
export const openGraph = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  url: siteMetadata.siteUrl,
  siteName: siteMetadata.siteName,
  images: [
    {
      url: siteMetadata.socialBanner,
      width: 1200,
      height: 630,
      alt: `${siteMetadata.title}`,
    },
  ],
  locale: "en_US",
  type: "website",
};

// Twitter card metadata
export const twitter = {
  card: "summary_large_image",
  title: siteMetadata.title,
  description: siteMetadata.description,
  images: [siteMetadata.socialBanner],
  creator: "@intxr",
};

// Icons and manifest related metadata
export const icons = {
  icon: [{ url: "/icon.svg" }, { url: "/favicon.ico" }],
  apple: [{ url: "/icon.png" }],
  shortcut: [{ url: "/favicon.ico" }],
};

// Font preload configuration
export const fontPreload = [
  {
    rel: "preload",
    href: "/fonts/inter-var.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

// Generate SVG-based OG image configuration
export const ogImageConfig = {
  width: 1200,
  height: 630,
  icon: "/og.svg",
  domain: new URL(BASE_URL).hostname,
  backgroundColor: "#000000",
  foregroundColor: "#ffffff",
};

// Manifest configuration
export const manifestConfig = {
  name: siteMetadata.title,
  short_name: siteMetadata.title,
  description: siteMetadata.description,
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#000000",
  icons: [
    {
      src: "/icon.svg",
      sizes: "any",
      type: "image/svg+xml",
    },
    {
      src: "/icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
};

// Robots and indexing configuration
export const robotsConfig = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const title = content.name;

// Extract and export descriptions from content
export const descriptions = Object.entries(content).reduce(
  (acc, [key, item]) => {
    if (
      typeof item === "object" &&
      "description" in item &&
      typeof item.description === "string"
    ) {
      acc[key] = {
        text: item.description,
        route: `/${key.toLowerCase()}`,
      };
    }
    return acc;
  },
  {} as Record<string, { text: string; route: string }>
);

// Sitemap configuration
export const sitemapConfig = {
  siteUrl: BASE_URL,
  generateRobotsTxt: true,
  routes: Object.values(descriptions).map(({ route }) => ({
    url: route,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  })),
  additionalRoutes: [
    {
      url: "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ],
};

// Meta tags for dynamic routes
export const getRouteMetadata = (route: string) => {
  const routeKey = Object.keys(descriptions).find(
    (key) => descriptions[key].route === route
  );

  if (!routeKey) return null;

  return {
    title: routeKey,
    description: descriptions[routeKey].text,
    openGraph: {
      ...openGraph,
      title: routeKey,
      description: descriptions[routeKey].text,
      url: `${BASE_URL}${route}`,
    },
    twitter: {
      ...twitter,
      title: routeKey,
      description: descriptions[routeKey].text,
    },
  };
};

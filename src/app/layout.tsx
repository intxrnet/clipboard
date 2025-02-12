import { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import {
  title,
  siteMetadata,
  openGraph,
  twitter,
  icons,
  keywords,
  robotsConfig,
} from "./metadata";
import { Robots } from "next/dist/lib/metadata/types/metadata-types";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title + " / intxr",
    template: `%s | ${siteMetadata.title} / intxr`,
  },
  description: siteMetadata.description,
  keywords: keywords,
  authors: [{ name: siteMetadata.author, url: siteMetadata.authorUrl }],
  creator: siteMetadata.author,

  // Open Graph
  openGraph,

  // Twitter
  twitter,

  // Icons
  icons,

  // Manifest
  manifest: "/manifest.json",
  // Robots - use the imported config instead of duplicating
  robots: robotsConfig as Robots,
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-background z-10 px-4">
      <h1 className="text-xl flex-1 flex justify-end">
        <Link href="/" className="hover:underline">
          {`${title}`}
        </Link>
      </h1>
      <h1 className="text-xl">
        .
        <Link href="https://www.intxr.net" className="hover:underline">
          intxr
        </Link>
        .
      </h1>
      <h1 className="text-xl flex-1 flex justify-start">
        <Link href="https://net.intxr.net" className="hover:underline">
          net
        </Link>
      </h1>
    </header>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 flex justify-between items-center px-4 text-gray-500 bg-background z-10">
      <Link
        href="https://github.com/intxrnet"
        className="hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        contribute:github/intxrnet
      </Link>
      <Link
        href="https://its-ours.org"
        className="hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        its-ours pledge
      </Link>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlex.variable}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <div className="h-16" aria-hidden="true"></div>
        <main className="flex-1 flex flex-col">{children}</main>
        <div className="h-8" aria-hidden="true"></div>
        <Footer />
      </body>
    </html>
  );
}

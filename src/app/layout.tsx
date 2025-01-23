import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

//!! CHANGE ME
const sub = "clipboard";
const domain = `https://${sub}.intxr.net`;

export const metadata: Metadata = {
  title: `${sub} intxrnet`,
  description: "Free, Open-Source, Client-Side Web Tools",
  keywords:
    "web tools, open source, client-side, development tools, browser tools",
  authors: [{ name: "intxrnet" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: domain,
    siteName: `${sub} intxrnet`,
    title: `${sub} intxrnet`,
    description: "Free, Open-Source, Client-Side Web Tools",
    images: [
      {
        url: "/image.png",
        width: 800,
        height: 800,
        alt: `${sub} intxrnet - Free, Open-Source, Client-Side Web Tools`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${sub} intxrnet`,
    description: "Free, Open-Source, Client-Side Web Tools",
    images: ["/icon.png"],
    creator: "@intxrnet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  alternates: {
    canonical: "https://www.intxr.net",
  },
  metadataBase: new URL("https://www.intxr.net"),
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-background z-10 px-4">
      <h1 className="text-xl flex-1 flex justify-end">
        <Link href={`https://${sub}.intxr.net`} className="hover:underline">
          {`${sub}`}
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
    <footer className="fixed bottom-2 left-0 right-0 h-8 flex justify-between items-center px-4 text-gray-500 bg-background z-10">
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ibmPlex.variable}>
      <body className="flex flex-col min-h-screen overflow-hidden">
        <Header />
        <div className="h-16" aria-hidden="true"></div>
        <main className="flex-1 flex flex-col">{children}</main>
        <div className="h-8" aria-hidden="true"></div>
        <Footer />
      </body>
    </html>
  );
}

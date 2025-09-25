import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tetris Web Game - Classic Puzzle Game",
  description:
    "Play the classic Tetris puzzle game in your browser. Built with Next.js and React for smooth, responsive gameplay. Features modern controls, scoring system, and accessibility support.",
  keywords: ["tetris", "puzzle game", "web game", "browser game", "react", "nextjs"],
  authors: [{ name: "Tetris Web Game" }],
  creator: "Tetris Web Game",
  publisher: "Tetris Web Game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Tetris Web Game - Classic Puzzle Game",
    description: "Play the classic Tetris puzzle game in your browser with modern controls and smooth gameplay.",
    type: "website",
    locale: "en_US",
    siteName: "Tetris Web Game",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tetris Web Game - Classic Puzzle Game",
    description: "Play the classic Tetris puzzle game in your browser with modern controls and smooth gameplay.",
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

        {/* Favicon and app icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/icon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        {/* Performance hints */}
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//fonts.gstatic.com' />
      </head>
      <body className='antialiased' suppressHydrationWarning>
        {/* Skip to main content for accessibility */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all'
        >
          Skip to main content
        </a>

        <div id='main-content'>{children}</div>

        {/* Performance monitoring script (only in production) */}
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Basic performance monitoring
                if ('performance' in window && 'PerformanceObserver' in window) {
                  const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'navigation') {
                        console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
                      }
                    }
                  });
                  observer.observe({ entryTypes: ['navigation'] });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

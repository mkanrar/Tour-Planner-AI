import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TourPlanner — AI-Powered Travel Planning",
  description:
    "Discover beautiful domestic and international tour destinations. Plan your perfect trip with our AI travel consultant.",
  openGraph: {
    title: "TourPlanner — AI-Powered Travel Planning",
    description: "Explore the world with personalized AI tour planning.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      {/*
        Inline script runs before hydration to apply saved theme,
        preventing a flash of the wrong theme on reload.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('tourplanner_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}

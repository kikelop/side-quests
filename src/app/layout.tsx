import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";
import { QuestsProvider } from "@/lib/QuestsProvider";
import TabBar from "@/components/TabBar";
import Toasts from "@/components/Toasts";

const onest = Onest({ subsets: ["latin"], variable: "--font-body", display: "swap", weight: ["400", "500", "600"] });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Side Quests",
  description: "Things to do at least once. Things to do today instead of scrolling.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Side Quests" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff7ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${onest.variable} ${unbounded.variable}`}>
      <body>
        <QuestsProvider>
          <div className="shell">{children}</div>
          <TabBar />
          <Toasts />
        </QuestsProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`,
          }}
        />
      </body>
    </html>
  );
}

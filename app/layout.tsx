import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "MarketBridge | Business meets talent",
  description: "A marketplace connecting businesses with developers, marketers and agencies."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { VeChainProvider } from "./providers/vechain/provider";
import { ChakraProviders } from "./providers/chakra/provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BigBottle",
  description: "BigBottle",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${roboto.className}`}>
        <ChakraProviders>
          <VeChainProvider>{children}</VeChainProvider>
        </ChakraProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}

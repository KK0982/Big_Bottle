import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { VeChainProvider } from "./providers/vechain/provider";
import { ChakraProviders } from "./providers/chakra/provider";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BigBottle",
  description: "BigBottle",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={`${roboto.className}`}>
        <ChakraProviders>
          <VeChainProvider>{children}</VeChainProvider>
        </ChakraProviders>
      </body>
    </html>
  );
}

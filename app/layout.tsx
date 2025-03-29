import { Play } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Pressboxd",
  description: "Share your thoughts with every game",
};

const play = Play({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={play.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}

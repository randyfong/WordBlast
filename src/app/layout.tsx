import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordBlast | Read It. Say It. Blast It!",
  description: "A colorful reading game made for fourth-grade word heroes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#fffaf0] text-[#183153] selection:bg-[#ffd166] selection:text-[#183153]">
        {children}
      </body>
    </html>
  );
}

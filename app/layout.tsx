import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motion Archive — FBX Preview",
  description: "FBXキャラクターモーションをブラウザで確認するプレビューライブラリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}

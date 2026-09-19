import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TattvaTech CRM",
  description: "TattvaTech Company Workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

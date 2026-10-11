import type { Metadata } from "next";
import { Archivo, JetBrains_Mono, Saira } from "next/font/google";
import "lenis/dist/lenis.css";
import "../styles/globals.css";

// Display: condensed (wdth 62) for hero words, expanded italic (wdth 125) for titles
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
});

// Body + extended labels
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Timing tower / telemetry numbers
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JPCS-TSU · Orange CS Community",
  description:
    "Junior Philippine Computer Society, Tarlac State University chapter, College of Computer Studies.",
};

// Runs before first paint: saved choice wins, otherwise follow the OS setting.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${saira.variable} ${archivo.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

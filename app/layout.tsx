import type { Metadata } from "next";
import { Archivo, Saira } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "../styles/globals.css";

// Official Formula1 Display, supplied by the organizers: hero words, labels, timing numbers
const f1 = localFont({
  variable: "--font-f1",
  src: [
    { path: "./fonts/f1-regular.woff2", weight: "400" },
    { path: "./fonts/f1-bold.woff2", weight: "700" },
    { path: "./fonts/f1-black.woff2", weight: "900" },
  ],
});

// Formula1 Display Wide: section titles and the wordmark
const f1Wide = localFont({ variable: "--font-f1-wide", src: "./fonts/f1-wide.woff2" });

// Condensed (wdth 62) for the 26/27 and BOX BOX watermarks, which F1 has no narrow cut for
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Body text and headings
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "JPCS-TSU · CS Community",
  description:
    "Junior Philippine Computer Society, Tarlac State University chapter, College of Computer Studies.",
};

// Runs before first paint: saved choice wins, otherwise follow the OS setting. Also marks whether the splash
// plays: skipped on repeat visits in this tab and under reduced motion (components/splash.tsx).
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}try{document.documentElement.setAttribute("data-splash",sessionStorage.getItem("splash")||matchMedia("(prefers-reduced-motion: reduce)").matches?"skip":"play")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${f1.variable} ${f1Wide.variable} ${saira.variable} ${archivo.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

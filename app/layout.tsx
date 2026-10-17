import type { Metadata } from "next";
import { Barlow, Big_Shoulders } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "../styles/globals.css";

// official F1 Display from the organizers
const f1 = localFont({
  variable: "--font-f1",
  src: [
    { path: "./fonts/f1-regular.woff2", weight: "400" },
    { path: "./fonts/f1-bold.woff2", weight: "700" },
    { path: "./fonts/f1-black.woff2", weight: "900" },
  ],
});

const f1Wide = localFont({ variable: "--font-f1-wide", src: "./fonts/f1-wide.woff2" });

// tall condensed poster type (F1 has no narrow cut), opsz axis picks the display cut at large sizes
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "JPCS-TSU · CS Community",
  description:
    "Junior Philippine Computer Society, Tarlac State University chapter, College of Computer Studies.",
};

// runs before first paint. saved theme wins, else OS setting. also sets data-splash (skipped on repeat visits and reduced motion)
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}try{document.documentElement.setAttribute("data-splash",sessionStorage.getItem("splash")||matchMedia("(prefers-reduced-motion: reduce)").matches?"skip":"play")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${f1.variable} ${f1Wide.variable} ${bigShoulders.variable} ${barlow.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

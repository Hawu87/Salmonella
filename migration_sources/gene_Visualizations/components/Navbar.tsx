"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SmoothScrollLink from "./SmoothScrollLink";

export default function Navbar() {
  const [openTab, setOpenTab] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const tabs = [
    {
      name: "Home",
      options: [
        { label: "Overview", href: "#hero" },
        { label: "Highlights", href: "#features" },
      ],
    },
    {
      name: "Data",
      options: [
        { label: "Data Explorer", href: "/data-explorer" },
      ],
    },
    {
      name: "Visuals",
      options: [
        { label: "Storylines", href: "#visuals" },
        { label: "Interactive Visualizations", href: "/visualizations" },
        { label: "Interactive Demo", href: "#demo" },
      ],
    },
    {
      name: "About",
      options: [
        { label: "Purpose", href: "#about" },
        { label: "Team", href: "#team" },
      ],
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          <span className="text-gray-900 dark:text-gray-100">Virulence</span>{" "}
          <span className="text-blue-600 dark:text-blue-400">Insights</span>
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 dark:text-gray-300 font-medium absolute left-1/2 -translate-x-1/2">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className="relative"
              onMouseEnter={() => setOpenTab(tab.name)}
              onMouseLeave={() => setOpenTab(null)}
            >
              {/* Main Tab */}
              {tab.name === "Home" ? (
                <Link
                  href="/"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {tab.name}
                </Link>
              ) : (
                <button className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {tab.name}
                </button>
              )}

              {/* Dropdown */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 transition-all duration-150 ${
                  openTab === tab.name
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-1"
                }`}
              >
                {tab.options.map((opt) => {
                  if (opt.href.startsWith('#')) {
                    // Hash link - use SmoothScrollLink if on home page, otherwise navigate to home + hash
                    if (isHomePage) {
                      return (
                        <SmoothScrollLink
                          key={opt.label}
                          href={opt.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {opt.label}
                        </SmoothScrollLink>
                      );
                    } else {
                      return (
                        <Link
                          key={opt.label}
                          href={`/${opt.href}`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {opt.label}
                        </Link>
                      );
                    }
                  }
                  return (
                    <Link
                      key={opt.label}
                      href={opt.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: CTA */}
        {isHomePage ? (
          <SmoothScrollLink
            href="#visuals"
            className="hidden md:inline-flex px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
          >
            Explore
          </SmoothScrollLink>
        ) : (
          <Link
            href="/#visuals"
            className="hidden md:inline-flex px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
          >
            Explore
          </Link>
        )}
      </div>
    </nav>
  );
}

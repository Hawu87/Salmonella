'use client';

import dynamic from "next/dynamic";
import Link from "next/link";
import { DataProvider } from "@/components/DataProvider";
import StoryCard from "@/components/StoryCard";

const DataExplorerTable = dynamic(
  () => import("@/components/data-explorer/DataExplorerTable"),
  { ssr: false }
);

export default function DataExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Data Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Explore the underlying virulence gene dataset through an interactive table. Search, sort, and filter records to examine patterns across species, hosts, and gene functions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <Link
            href="/visualizations"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base"
          >
            Back to Visualizations
          </Link>
          <a
            href="/data/campylobacter%20(1).xlsx"
            download="campylobacter (1).xlsx"
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition text-sm sm:text-base"
          >
            Download Excel File
          </a>
        </div>

        {/* Table */}
        <StoryCard
          title="Dataset Preview"
          desc="Browse gene-level records with interactive search and sorting. Use the controls below the table to refine results."
        >
          <DataProvider>
            <DataExplorerTable />
          </DataProvider>
        </StoryCard>
      </div>
    </div>
  );
}


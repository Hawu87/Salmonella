'use client';

interface ControlPanelProps {
  topN: number;
  showPercent: boolean;
  onTopNChange: (value: number) => void;
  onShowPercentChange: (value: boolean) => void;
  onResetFilters: () => void;
}

/**
 * Control panel for dashboard visualizations.
 * Provides controls for top N selection, count/percent toggle, and reset filters.
 */
export default function ControlPanel({
  topN,
  showPercent,
  onTopNChange,
  onShowPercentChange,
  onResetFilters,
}: ControlPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="topN" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Top N Genes:
          </label>
          <select
            id="topN"
            value={topN}
            onChange={(e) => onTopNChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select number of top genes to display"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPercent}
              onChange={(e) => onShowPercentChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label="Toggle between counts and percentages"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Percentages</span>
          </label>
        </div>

        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}


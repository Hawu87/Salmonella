const SUMMARY_DOC_URL =
  'https://docs.google.com/document/d/1nGM_d6KqRyYwXWut-rQ5fjyRseuA2HIZdevH4Ug_-ig/edit?tab=t.0';
const NCBI_URL = 'https://www.ncbi.nlm.nih.gov/';

/**
 * Reusable footer for visualization sections: links to the Gene Summary Document
 * and notes content derived from NCBI. Not part of the numbered References system.
 */
export default function VizSourceFooter() {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-600 dark:text-gray-500">Summary Source: </span>
        <a
          href={SUMMARY_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          Gene Summary Document
        </a>
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Content derived from{' '}
        <a
          href={NCBI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          NCBI
        </a>{' '}
        resources.
      </p>
    </div>
  );
}

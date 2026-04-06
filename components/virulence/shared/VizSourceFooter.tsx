const SUMMARY_DOC_URL =
  'https://docs.google.com/document/d/1nGM_d6KqRyYwXWut-rQ5fjyRseuA2HIZdevH4Ug_-ig/edit?tab=t.0';
const NCBI_URL = 'https://www.ncbi.nlm.nih.gov/';

export default function VizSourceFooter() {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500">
        <span className="font-medium text-gray-600">Summary Source: </span>
        <a
          href={SUMMARY_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline hover:opacity-80 transition"
        >
          Gene Summary Document
        </a>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Content derived from{' '}
        <a
          href={NCBI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline hover:opacity-80 transition"
        >
          NCBI
        </a>{' '}
        resources.
      </p>
    </div>
  );
}

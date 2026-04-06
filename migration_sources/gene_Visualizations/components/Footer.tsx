export default function Footer() {
  return (
    <footer className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
      © {new Date().getFullYear()} Virulence Insights.
    </footer>
  );
}

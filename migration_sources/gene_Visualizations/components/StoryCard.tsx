export default function StoryCard({ 
  title, 
  desc, 
  children 
}: { 
  title: string; 
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">{desc}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

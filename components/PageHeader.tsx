interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-8 lg:mb-10">
      <h1 className="font-serif text-3xl font-bold text-[#111827] lg:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-[#6B7280] lg:text-lg">{subtitle}</p>
    </header>
  );
}

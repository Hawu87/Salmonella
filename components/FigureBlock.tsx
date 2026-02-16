interface FigureBlockProps {
  label: string;
  title: string;
  caption: string;
}

export default function FigureBlock({ label, title, caption }: FigureBlockProps) {
  return (
    <figure className="mb-14 last:mb-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </p>
      <h3 className="mb-4 text-lg font-semibold text-[#111827]">{title}</h3>
      <div className="flex h-[300px] items-center justify-center border border-[#E5E7EB] bg-white text-[#6B7280]">
        Visualization placeholder
      </div>
      <figcaption className="mt-4 text-sm text-[#6B7280]">{caption}</figcaption>
    </figure>
  );
}

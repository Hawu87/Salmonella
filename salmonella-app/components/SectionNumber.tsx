interface SectionNumberProps {
  number: string;
  className?: string;
  size?: "default" | "large";
}

export default function SectionNumber({
  number,
  className = "",
  size = "large",
}: SectionNumberProps) {
  const sizeClass =
    size === "large" ? "text-6xl lg:text-7xl font-extralight" : "text-base";
  return (
    <span
      className={`tabular-nums text-[#6B7280] selection:bg-[#0F766E] selection:text-white ${sizeClass} ${className}`}
      aria-hidden
    >
      {number}
    </span>
  );
}

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  as?: "span" | "button";
  href?: string;
  className?: string;
}

export default function Chip({
  children,
  active = false,
  onClick,
  as: Component = "span",
  href,
  className = "",
}: ChipProps) {
  const base =
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ";
  const activeStyle =
    "border-[#0F766E] bg-[#0F766E] text-white";
  const inactiveStyle = "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E]/50";

  const combined = `${base} ${active ? activeStyle : inactiveStyle} ${className}`;

  if (href) {
    return (
      <a href={href} className={combined}>
        {children}
      </a>
    );
  }

  if (Component === "button") {
    return (
      <button type="button" onClick={onClick} className={combined}>
        {children}
      </button>
    );
  }

  return <span className={combined}>{children}</span>;
}

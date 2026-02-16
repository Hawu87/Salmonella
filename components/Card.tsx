interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

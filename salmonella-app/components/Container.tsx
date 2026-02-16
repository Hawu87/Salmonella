interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto max-w-[1100px] px-6 py-10 lg:px-8 lg:py-14 ${className}`}
    >
      {children}
    </div>
  );
}

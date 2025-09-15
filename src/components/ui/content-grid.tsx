import { ReactNode } from "react";

interface ContentGridProps {
  children: ReactNode;
  className?: string;
}

export function ContentGrid({ children, className = "" }: ContentGridProps) {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-3 gap-8 ${className}`}>
      {children}
    </div>
  );
}

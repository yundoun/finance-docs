interface SummaryBoxProps {
  children: React.ReactNode;
}

export function SummaryBox({ children }: SummaryBoxProps) {
  return (
    <div className="my-6 rounded-lg border border-primary-200 bg-primary-50/50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
        한 줄 요약
      </p>
      <p className="text-base font-medium leading-relaxed text-neutral-800">
        {children}
      </p>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, action, className = "" }: PageHeaderProps) {
  return (
    <div className={["flex items-end justify-between gap-4 mb-6", className].filter(Boolean).join(" ")}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[22px] font-bold text-ink leading-tight truncate">{title}</h1>
        {description && (
          <p className="text-[13px] text-ink-subtle mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

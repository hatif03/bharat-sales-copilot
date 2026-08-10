export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-lg flex items-start justify-between gap-md">
      <div>
        <div className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
          {eyebrow}
        </div>
        <h1 className="font-headline-lg text-headline-lg tracking-headline-lg text-primary">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl font-body-md text-body-md text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

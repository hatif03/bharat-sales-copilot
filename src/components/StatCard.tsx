export function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-md">
      <div className="flex items-center gap-xs font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-headline-md text-headline-md text-primary">{value}</div>
    </div>
  );
}

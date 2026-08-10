export function Topbar() {
  return (
    <div className="flex h-14 items-center justify-end gap-md border-b border-border bg-surface px-lg">
      <button
        aria-label="Settings"
        className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-neutral"
      >
        {"⚙"}
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-label-caps text-label-caps text-neutral">
        BS
      </div>
    </div>
  );
}

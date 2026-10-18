import type { ReactNode } from "react";

export function EmptyState({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <p className="empty">{children}</p>
      {action}
    </div>
  );
}

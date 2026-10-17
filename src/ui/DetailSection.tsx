import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  empty?: boolean;
  children?: ReactNode;
};

export function DetailSection({ title, empty = false, children }: DetailSectionProps) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {empty ? <p>Not listed.</p> : children}
    </section>
  );
}

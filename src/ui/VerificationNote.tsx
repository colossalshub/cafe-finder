import type { Verification } from "../domain/types";

export function VerificationNote({ verification }: { verification: Verification }) {
  if (verification === "fixture") {
    return (
      <p className="note">Demonstration record. This is not a real café.</p>
    );
  }
  if (verification === "community") {
    return <p className="note">Community-sourced. Not a verified listing.</p>;
  }
  if (verification === "unverified") {
    return <p>Not listed.</p>;
  }
  return null;
}

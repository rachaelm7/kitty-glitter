import { Dot } from "@/core/ui/primitives";
import { mockEmailProvider } from "../data/mock";
import type { AccountId } from "../data/types";

export function AccountDot({ account }: { account: AccountId }) {
  const a = mockEmailProvider.listAccounts().find((x) => x.id === account);
  return <Dot color={a?.color ?? "var(--muted)"} />;
}

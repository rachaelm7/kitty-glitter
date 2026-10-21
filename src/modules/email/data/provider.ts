import type { Account, CleanupProposal, Message, PromoSender } from "./types";

/**
 * The email provider is read-only by design. There is no send, delete,
 * archive or unsubscribe method here. Destructive actions are described as
 * proposals; a separate, explicitly confirmed step (a later phase, server
 * side) would carry them out.
 */
export interface EmailProvider {
  listAccounts(): Account[];
  listMessages(): Message[];
  listPromoSenders(): PromoSender[];
  /** Phase 1: simulates the result without touching any mailbox. */
  previewCleanup(proposals: CleanupProposal[]): { senders: number; emails: number };
}

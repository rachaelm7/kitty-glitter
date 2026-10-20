// Public API of the email module. Other modules import only from here.
export { mockEmailProvider as emailProvider } from "./data/mock";
export type { Account, AccountId, Message, PromoSender } from "./data/types";
export { promoTotal } from "./data/logic";
export { AccountDot } from "./components/AccountDot";
export { InboxScreen } from "./components/InboxScreen";
export { CleanupScreen } from "./components/CleanupScreen";
export { CleanupReview } from "./components/CleanupReview";

// Public API of the Appointment Concierge (fictional data, not medical advice).
export { AppointmentsScreen } from "./components/AppointmentsScreen";
export { appointmentStore } from "./data/store";
export { needsAttention, nextActions } from "./data/logic";
export { STATUS_LABEL } from "./data/types";
export type { Appointment, Status } from "./data/types";

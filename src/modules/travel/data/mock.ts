import type { Trip } from "./types";

// Fictional trips. Confirmation codes, hotels and venues are made up.
export const SEED_TRIPS: Trip[] = [
  {
    id: "lisbon", name: "Lisbon getaway", destination: "Lisbon, Portugal", startOffset: 24, nights: 5, threadId: "t-lisbon",
    reservations: [
      { id: "r1", kind: "flight", title: "Cedar Coast Airlines CC 214", dayIndex: 0, time: "6:40 PM", detail: "Seat 14A · check-in opens 24h before", confirmation: "KG7Q2X" },
      { id: "r2", kind: "stay", title: "Casa Azulejo Guesthouse", dayIndex: 1, time: "3:00 PM check-in", detail: "5 nights · breakfast included", confirmation: "AZ-48213" },
      { id: "r3", kind: "activity", title: "Tram 28 & old town walk", dayIndex: 2, time: "10:00 AM", detail: "Meets by the cathedral steps", confirmation: "WALK-551" },
      { id: "r4", kind: "dining", title: "Dinner at Maré Alta", dayIndex: 3, time: "8:00 PM", detail: "Table for two", confirmation: "MA-0932" },
      { id: "r5", kind: "transport", title: "Day train to Sintra", dayIndex: 4, time: "9:15 AM", detail: "Return 5:40 PM", confirmation: "TRN-7781" },
      { id: "r6", kind: "flight", title: "Cedar Coast Airlines CC 215", dayIndex: 6, time: "11:05 AM", detail: "Seat 14A", confirmation: "KG7Q2X" },
    ],
    packing: [
      { id: "p1", label: "Passport", group: "Documents", packed: false },
      { id: "p2", label: "Printed guesthouse confirmation", group: "Documents", packed: false },
      { id: "p3", label: "Travel insurance card", group: "Documents", packed: true },
      { id: "p4", label: "Walking shoes", group: "Clothes", packed: false },
      { id: "p5", label: "Light rain jacket", group: "Clothes", packed: false },
      { id: "p6", label: "Sunscreen", group: "Toiletries", packed: false },
      { id: "p7", label: "Plug adapter (Type F)", group: "Tech", packed: false },
      { id: "p8", label: "Phone charger", group: "Tech", packed: true },
      { id: "p9", label: "Reusable water bottle", group: "Other", packed: false },
    ],
  },
  {
    id: "cabin", name: "Lake cabin weekend", destination: "Pine Hollow Lake", startOffset: 52, nights: 2,
    reservations: [{ id: "c1", kind: "stay", title: "Pine Hollow Cabins, cabin 4", dayIndex: 0, time: "4:00 PM check-in", detail: "2 nights", confirmation: "PH-2210" }],
    packing: [
      { id: "c-p1", label: "Hiking boots", group: "Clothes", packed: false },
      { id: "c-p2", label: "Board games", group: "Other", packed: false },
    ],
  },
];

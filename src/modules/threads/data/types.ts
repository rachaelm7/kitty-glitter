/** A Life Thread ties related tasks, emails, appointments and plans together. */
export type LifeThread = {
  id: string;
  name: string;
  color: string;
  blurb: string;
  /** Lowercase words that suggest a capture belongs to this thread. */
  keywords: string[];
};

export type ThreadNote = { id: string; threadId: string; text: string; createdAt: number };

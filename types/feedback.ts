export interface Feedback {
  id: string;
  content: string;
  createdAt: number;
  upvotes: number;
}

export type FeedbackSortMode = "latest" | "oldest" | "upvotes";

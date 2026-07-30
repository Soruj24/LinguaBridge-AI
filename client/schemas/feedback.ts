import { z } from "zod";

export const feedbackFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

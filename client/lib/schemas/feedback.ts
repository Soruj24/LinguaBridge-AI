import * as z from "zod";

export const feedbackFormSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().min(10, "Feedback must be at least 10 characters."),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

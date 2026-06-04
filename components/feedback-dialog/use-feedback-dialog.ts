"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { feedbackFormSchema, type FeedbackFormValues } from "@/lib/schemas/feedback";

export function useFeedbackDialog() {
  const t = useTranslations("Feedback");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { email: "", message: "" },
  });

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Feedback submitted:", values);
    toast.success(t("success"));
    setIsSubmitting(false);
    setOpen(false);
    form.reset();
  }

  return { open, setOpen, form, isSubmitting, onSubmit };
}

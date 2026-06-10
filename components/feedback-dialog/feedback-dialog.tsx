"use client";

import { Loader2, MessageSquarePlus, Sparkles, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFeedbackDialog } from "./use-feedback-dialog";

export function FeedbackDialog() {
  const t = useTranslations("Feedback");
  const { open, setOpen, form, isSubmitting, onSubmit } = useFeedbackDialog();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          <Sparkles className="h-4 w-4" />
          <span>{t("trigger")}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <MessageSquarePlus className="h-4 w-4 text-primary-foreground" />
                </div>
                {t("title")}
              </DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("emailLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("emailPlaceholder")} {...field} className="h-11 rounded-xl bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("messageLabel")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("messagePlaceholder")}
                          className="min-h-[100px] rounded-xl bg-muted/50 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isSubmitting ? t("submitting") : t("submit")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  preferredLanguage: z.string().min(2, "Language is required"),
  avatar: z.string().url().optional().or(z.literal("")),
  preferences: z.object({
    lowBandwidth: z.boolean(),
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
    autoPlayAudio: z.boolean(),
  }),
});

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "bn", name: "Bengali" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      preferredLanguage: "en",
      avatar: "",
      preferences: {
        lowBandwidth: false,
        reduceMotion: false,
        highContrast: false,
        autoPlayAudio: true,
      },
    },
  });

  useEffect(() => {
    if (session?.user) {
      // Safely cast user to any to access custom fields not in default NextAuth types yet
      const user = session.user as {
        name?: string;
        preferredLanguage?: string;
        avatar?: string;
        preferences?: {
          lowBandwidth?: boolean;
          reduceMotion?: boolean;
          highContrast?: boolean;
          autoPlayAudio?: boolean;
        };
      };
      form.reset({
        name: user.name || "",
        preferredLanguage: user.preferredLanguage || "en",
        avatar: user.avatar || "",
        preferences: {
          lowBandwidth: user.preferences?.lowBandwidth || false,
          reduceMotion: user.preferences?.reduceMotion || false,
          highContrast: user.preferences?.highContrast || false,
          autoPlayAudio: user.preferences?.autoPlayAudio ?? true,
        },
      });
    }
  }, [session, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await axios.put("/api/user/update", values);
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          avatar: values.avatar,
          preferredLanguage: values.preferredLanguage,
        },
      });

      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Update your profile information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Messages will be translated to this language.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Provide a URL for your profile picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 border-t mt-4">
                <h3 className="text-sm font-semibold mb-3">Accessibility & Data</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="preferences.lowBandwidth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Low Bandwidth Mode</FormLabel>
                          <FormDescription className="text-xs">
                            Disable animations and high-res media.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.reduceMotion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Reduce Motion</FormLabel>
                          <FormDescription className="text-xs">
                            Minimize UI animations.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.autoPlayAudio"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Auto-play Audio</FormLabel>
                          <FormDescription className="text-xs">
                            Automatically play voice messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

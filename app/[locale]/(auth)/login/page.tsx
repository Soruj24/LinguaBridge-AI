"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Globe } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success("Logged in successfully");
        
        try {
          // Fetch user profile to get preferred language
          const { data } = await axios.get("/api/user/me");
          const preferredLanguage = data.preferredLanguage || "en";
          
          // Redirect to dashboard with preferred language
          router.push("/dashboard", { locale: preferredLanguage });
          router.refresh();
        } catch (error) {
          console.error("Failed to fetch user preferences", error);
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">LinguaBridge AI</span>
        </div>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline hover:text-primary">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

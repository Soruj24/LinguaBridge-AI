"use client";

import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/navigation";
import type { UseFormReturn } from "react-hook-form";

type FormValues = { password: string; confirmPassword: string };

interface ResetPasswordFormProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
}

export function ResetPasswordForm({
  form, onSubmit, isLoading, isSuccess,
  showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
}: ResetPasswordFormProps) {
  return (
    <div>
      <Card className="w-full border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSuccess ? "Password Reset Successful" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-sm">
            {isSuccess ? "Your password has been reset successfully." : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Password changed!</h3>
              <p className="text-muted-foreground text-sm max-w-[300px]">Redirecting to login...</p>
              <div className="mt-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            </div>
          ) : (
            <div>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type={showPassword ? "text" : "password"} placeholder="Enter new password" {...field} className="h-11 rounded-xl pl-10 pr-10" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" {...field} className="h-11 rounded-xl pl-10 pr-10" />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : "Reset Password"}
                    </Button>
                  </form>
                </Form>
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-6">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

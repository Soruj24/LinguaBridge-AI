"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Globe, Home, ArrowLeft, MessageSquare, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] -right-[10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto">
            <Globe className="h-8 w-8 text-primary-foreground" />
          </div>
        </motion.div>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl font-semibold text-foreground">
            Page not found
          </p>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/">
            <Button size="lg" className="h-12 px-8 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 gap-2 rounded-xl"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4 border-t border-muted"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Or try these helpful pages:
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Sign In
            </Link>
            <Link href="/register" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Create Account
            </Link>
            <Link href="/dashboard" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" />
              Dashboard
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

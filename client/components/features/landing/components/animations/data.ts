import {
  MessageSquare, Globe, Mic, ShieldCheck, Zap, Users,
  Languages,
} from "lucide-react";

export const stats = [
  { label: "Active Users", value: 50000, suffix: "+", icon: Users },
  { label: "Languages Supported", value: 50, suffix: "+", icon: Languages },
  { label: "Messages Translated", value: 10, suffix: "M+", icon: MessageSquare },
  { label: "Countries Reached", value: 180, suffix: "+", icon: Globe },
];

export const features = [
  {
    icon: MessageSquare, titleKey: "chat",
    gradient: "from-blue-500/20 to-blue-600/5", iconBg: "from-blue-500 to-blue-600",
  },
  {
    icon: Mic, titleKey: "voice",
    gradient: "from-purple-500/20 to-purple-600/5", iconBg: "from-purple-500 to-purple-600",
  },
  {
    icon: Globe, titleKey: "autoDetect",
    gradient: "from-emerald-500/20 to-emerald-600/5", iconBg: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users, titleKey: "globalConnect",
    gradient: "from-amber-500/20 to-amber-600/5", iconBg: "from-amber-500 to-amber-600",
  },
  {
    icon: Zap, titleKey: "lightningFast",
    gradient: "from-rose-500/20 to-rose-600/5", iconBg: "from-rose-500 to-rose-600",
  },
  {
    icon: ShieldCheck, titleKey: "secure",
    gradient: "from-cyan-500/20 to-cyan-600/5", iconBg: "from-cyan-500 to-cyan-600",
  },
];

export const testimonials = [
  {
    name: "Sarah Chen", role: "International Business Consultant", avatar: "SC",
    content: "LinguaBridge has transformed how I communicate with clients across Asia. The real-time translation is incredibly accurate and natural-sounding.",
    rating: 5,
  },
  {
    name: "Marco Rossi", role: "Travel Blogger", avatar: "MR",
    content: "I travel to 20+ countries yearly and this app is a lifesaver. The voice translation feature helps me navigate conversations effortlessly.",
    rating: 5,
  },
  {
    name: "Aisha Patel", role: "Language Educator", avatar: "AP",
    content: "As a language teacher, I recommend LinguaBridge to all my students. It bridges the gap between learning and real-world communication.",
    rating: 5,
  },
];

export const languagesList = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese",
  "Korean", "Russian", "Portuguese", "Italian", "Arabic", "Hindi",
  "Bengali", "Turkish", "Dutch", "Polish", "Vietnamese", "Thai",
  "Swedish", "Greek", "Hebrew", "Czech", "Romanian", "Ukrainian",
  "Hungarian", "Finnish", "Danish", "Norwegian", "Malay", "Tamil",
  "Telugu", "Urdu", "Persian", "Swahili", "Punjabi", "Gujarati",
];

export const faqItems = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
];

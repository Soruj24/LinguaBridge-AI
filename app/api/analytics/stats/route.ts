 import { NextResponse } from "next/server";
 import connectDB from "@/lib/db";
 import Message from "@/models/Message";
 
 export async function GET() {
   try {
     await connectDB();
 
     const now = new Date();
     const startOfThisWeek = new Date(now);
     startOfThisWeek.setDate(now.getDate() - 7);
     const startOfPrevWeek = new Date(now);
     startOfPrevWeek.setDate(now.getDate() - 14);
 
     const [messagesTotal, translationsTotal, voiceTranslationsTotal] = await Promise.all([
       (Message as any).countDocuments({}),
       (Message as any).countDocuments({ translatedText: { $exists: true, $ne: "" } }),
       (Message as any).countDocuments({ translatedVoiceUrl: { $exists: true, $ne: "" } }),
     ]);
 
     const [messagesThisWeek, messagesPrevWeek, translationsThisWeek, translationsPrevWeek, voiceThisWeek, voicePrevWeek] =
       await Promise.all([
         (Message as any).countDocuments({ createdAt: { $gte: startOfThisWeek } }),
         (Message as any).countDocuments({ createdAt: { $gte: startOfPrevWeek, $lt: startOfThisWeek } }),
         (Message as any).countDocuments({
           translatedText: { $exists: true, $ne: "" },
           updatedAt: { $gte: startOfThisWeek },
         }),
         (Message as any).countDocuments({
           translatedText: { $exists: true, $ne: "" },
           updatedAt: { $gte: startOfPrevWeek, $lt: startOfThisWeek },
         }),
         (Message as any).countDocuments({
           translatedVoiceUrl: { $exists: true, $ne: "" },
           updatedAt: { $gte: startOfThisWeek },
         }),
         (Message as any).countDocuments({
           translatedVoiceUrl: { $exists: true, $ne: "" },
           updatedAt: { $gte: startOfPrevWeek, $lt: startOfThisWeek },
         }),
       ]);
 
     return NextResponse.json({
       data: {
         messages: {
           total: messagesTotal,
           delta: messagesThisWeek - messagesPrevWeek,
         },
         translations: {
           total: translationsTotal,
           deltaPercent:
             translationsPrevWeek > 0
               ? Math.round(((translationsThisWeek - translationsPrevWeek) / translationsPrevWeek) * 100)
               : 0,
         },
         voiceTranslations: {
           total: voiceTranslationsTotal,
           delta: voiceThisWeek - voicePrevWeek,
         },
       },
     });
   } catch (error) {
     console.error("Stats analytics error:", error);
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
 }

import fs from "fs";
import { getOpenAI } from "./client";

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    const response = await getOpenAI().audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return response.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    const response = await getOpenAI().audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export async function translateVoice(
  text: string,
  _targetLanguageCode?: string,
  targetVoice: string = "alloy",
): Promise<Buffer> {
  try {
    const response = await getOpenAI().audio.speech.create({
      model: "tts-1",
      voice: targetVoice,
      input: text,
    });
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("Voice translation error:", error);
    throw error;
  }
}

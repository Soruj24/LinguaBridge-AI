import { NextResponse } from "next/server";

const FALLBACK_GIFS = [
  { id: "1", url: "https://media.tenor.com/3GQlJ4Q5NmgAAAAC/hello-wave.gif", title: "Hello Wave" },
  { id: "2", url: "https://media.tenor.com/GfSXl0Q1eFAAAAAd/laughing-lmao.gif", title: "Laughing" },
  { id: "3", url: "https://media.tenor.com/4GdMz0h0i9YAAAAC/clapping-applause.gif", title: "Clapping" },
  { id: "4", url: "https://media.tenor.com/Zc3IavBBrwYAAAAd/thank-you-thanks.gif", title: "Thank You" },
  { id: "5", url: "https://media.tenor.com/IqO1VY4KRvAAAAAC/yes-thumbs-up.gif", title: "Thumbs Up" },
  { id: "6", url: "https://media.tenor.com/6h7Z1cL7z6MAAAAd/sad-crying.gif", title: "Sad Crying" },
  { id: "7", url: "https://media.tenor.com/BQqO4jGc2RYAAAAd/perfect-kiss.gif", title: "Perfect Kiss" },
  { id: "8", url: "https://media.tenor.com/CVkSDNRQe2AAAAAd/wow-amazing.gif", title: "Amazing" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const apiKey = process.env.TENOR_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ gifs: FALLBACK_GIFS });
  }

  try {
    const endpoint = query
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=20`
      : `https://tenor.googleapis.com/v2/featured?key=${apiKey}&limit=20`;

    const res = await fetch(endpoint);
    const data = await res.json();

    const gifs = (data.results || []).map((g: any) => ({
      id: g.id,
      url: g.media_formats?.gif?.url || g.media_formats?.tinygif?.url || "",
      title: g.title || "",
    }));

    return NextResponse.json({ gifs });
  } catch {
    return NextResponse.json({ gifs: FALLBACK_GIFS });
  }
}

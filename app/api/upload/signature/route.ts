// app/api/upload/signature/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    // Unique path: signatures/{userId}/{timestamp}.png
    const now = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `${userId}/${now}.png`;

    // Upload to Supabase bucket (private)
    const { error: uploadError } = await supabase.storage.from("signature").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Create signed URL (valid 24h)
    const { data: signedData, error: signedError } = await supabase.storage.from("signature").createSignedUrl(filePath, 60 * 60 * 24);

    if (signedError) {
      console.error("Supabase signed URL error:", signedError);
      return NextResponse.json({ error: "Signed URL failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileUrl: signedData.signedUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

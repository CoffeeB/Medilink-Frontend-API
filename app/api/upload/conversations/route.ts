import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;
    const type = formData.get("type") as string; // "image" or "document"

    if (!file || !conversationId || !type) {
      return NextResponse.json({ error: "Missing file, type, or conversationId" }, { status: 400 });
    }

    // Pick folder by type
    const folder = `${type}s`;

    // Build unique path: /conversations/{id}/{date}/{folder}/{filename}
    const now = new Date();
    const today = now.toISOString().replace(/[:.]/g, "-");
    const filePath = `conversations/${conversationId}/${today}/${folder}/${file.name}`;

    // Upload to Supabase storage (uploads bucket)
    const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Create signed URL valid for 24 hours (adjust as needed)
    const { data: signedData, error: signedError } = await supabase.storage.from("uploads").createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

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

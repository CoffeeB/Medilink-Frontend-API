import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string; // must be passed from frontend

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    console.log("profile id - ", userId);

    // Build path: avatars/{userId}/{filename}
    const filePath = `${userId}/${file.name}`;

    // Upload to Supabase storage (avatar bucket, private)
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // replace old avatar
      });

    if (uploadError) {
      console.error("Supabase avatar upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Generate a signed URL valid for 24 hours
    const { data: signedData, error: signedError } = await supabase.storage
      .from("avatar")
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

    if (signedError) {
      console.error("Supabase signed URL error:", signedError);
      return NextResponse.json({ error: "Signed URL failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileUrl: signedData.signedUrl, // temporary URL for private file
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

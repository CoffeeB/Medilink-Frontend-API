import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;
    const type = formData.get("type") as string; // "image" or "document"

    if (!file || !conversationId || !type) {
      return NextResponse.json({ error: "Missing file, type, or conversationId" }, { status: 400 });
    }

    // Choose folder by type
    const folder = `${type}s`;

    // Current date (yyyy-mm-dd)
    const now = new Date();
    const today = now
      .toISOString() // "2025-09-25T07:43:12.345Z"
      .replace("T", "-") // "2025-09-25-07:43:12.345Z"
      .replace(/\..+/, "") // "2025-09-25-07:43:12"
      .replace(/:/g, "-"); // "2025-09-25-07-43-12"

    // Full directory path inside /public
    const uploadDir = path.join(process.cwd(), "public", "uploads", "conversations", conversationId, today, folder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Full file path
    const filePath = path.join(uploadDir, file.name);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Public URL (served from /public)
    const fileUrl = `/uploads/conversations/${conversationId}/${today}/${folder}/${encodeURIComponent(file.name)}`;

    return NextResponse.json({ success: true, fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}

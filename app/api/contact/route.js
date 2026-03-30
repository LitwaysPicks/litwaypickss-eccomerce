import { NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 },
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 },
      );
    }

    await sendContactEmails({ name: name.trim(), email: email.trim(), subject, message: message.trim() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}

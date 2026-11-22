import { NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/email";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Please fill in your name, email and message." },
        { status: 400 },
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    await sendContactEmails({ name: name.trim(), email: email.trim(), subject, message: message.trim() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error.message);
    return NextResponse.json(
      { success: false, message: "We couldn't send your message. Please try again, or reach us on WhatsApp." },
      { status: 500 },
    );
  }
}

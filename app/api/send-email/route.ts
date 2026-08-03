import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // Validate SMTP environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          error:
            "SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env.local file.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const to = formData.get("to") as string | null;
    const subject = formData.get("subject") as string | null;
    const body = formData.get("body") as string | null;
    const attachment = formData.get("attachment") as File | null;
    const filename = (formData.get("filename") as string) || "certificate.pdf";

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body." },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort ?? "587", 10),
      secure: parseInt(smtpPort ?? "587", 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Build attachments array
    const attachments: nodemailer.SendMailOptions["attachments"] = [];
    if (attachment) {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      attachments.push({
        filename,
        content: buffer,
        contentType: "application/pdf",
      });
    }

    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to,
      subject,
      text: body,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

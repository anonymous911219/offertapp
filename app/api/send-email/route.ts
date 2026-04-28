import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  console.log("🔥 SEND EMAIL API HIT");

  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const resend = new Resend(apiKey);

    const data = await req.json();

    if (!data?.email) {
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const doc = new jsPDF();

    doc.text("Fönsterputs Offert", 20, 20);
    doc.text(`Offert: ${data.offert_id || "-"}`, 20, 40);
    doc.text(`Namn: ${data.namn || "-"}`, 20, 50);
    doc.text(`Email: ${data.email || "-"}`, 20, 60);
    doc.text(`Pris: ${data.pris || 0} kr`, 20, 70);

    const pdf = doc.output("arraybuffer");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Din offert ${data.offert_id || ""}`,
      html: `<p>Din offert är bifogad.</p>`,
      attachments: [
        {
          filename: `offert.pdf`,
          content: Buffer.from(pdf),
        },
      ],
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
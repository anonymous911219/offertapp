import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("🔥 SEND EMAIL API HIT");

  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const data = await req.json();

    if (!data?.email) {
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    // 📄 PDF
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Fönsterputs Offert", 20, 20);

    doc.setFontSize(12);
    doc.text(`Offertnummer: ${data.offert_id || "-"}`, 20, 40);
    doc.text(`Namn: ${data.namn || "-"}`, 20, 50);
    doc.text(`Email: ${data.email || "-"}`, 20, 60);
    doc.text(`Pris: ${data.pris || 0} kr`, 20, 80);

    const pdfArrayBuffer = doc.output("arraybuffer");

    // 📩 EMAIL
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Din offert ${data.offert_id || ""}`,
      html: `
        <h1>Fönsterputs Offert</h1>
        <p>Hej ${data.namn || "kund"},</p>
        <p>Din offert är bifogad.</p>
        <p><b>Pris:</b> ${data.pris || 0} kr</p>
      `,
      attachments: [
        {
          filename: `offert-${data.offert_id || "unknown"}.pdf`,
          content: Buffer.from(pdfArrayBuffer),
        },
      ],
    });

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
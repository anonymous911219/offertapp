import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

    /* =========================
       PDF GENERATION
    ========================= */

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Fönsterputs Offert", 20, 20);

    doc.setFontSize(12);

    doc.text(`Offertnummer: ${data.offert_id ?? "-"}`, 20, 40);
    doc.text(`Namn: ${data.namn ?? "-"}`, 20, 50);
    doc.text(`Email: ${data.email ?? "-"}`, 20, 60);
    doc.text(`Antal fönster: ${data.antal_fonster ?? 0}`, 20, 70);
    doc.text(`Bredd: ${data.bredd ?? 0} cm`, 20, 80);
    doc.text(`Höjd: ${data.hojd ?? 0} cm`, 20, 90);
    doc.text(`Spröjs: ${data.sprojs ? "Ja" : "Nej"}`, 20, 100);

    doc.setFontSize(14);
    doc.text(`Totalpris: ${data.pris ?? 0} kr`, 20, 120);

    const pdfArrayBuffer = doc.output("arraybuffer");

    /* =========================
       SEND EMAIL
    ========================= */

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Din offert ${data.offert_id ?? ""}`,
      html: `
        <h1>Fönsterputs Offert</h1>
        <p>Hej ${data.namn ?? "kund"},</p>
        <p>Tack för din förfrågan!</p>
        <p><b>Offertnummer:</b> ${data.offert_id ?? "-"}</p>
        <p><b>Pris:</b> ${data.pris ?? 0} kr</p>
        <p>PDF är bifogad.</p>
      `,
      attachments: [
        {
          filename: `offert-${data.offert_id ?? "unknown"}.pdf`,
          content: Buffer.from(pdfArrayBuffer),
        },
      ],
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("EMAIL ERROR:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
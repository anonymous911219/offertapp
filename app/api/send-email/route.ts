import { NextRequest } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";

export const runtime = "nodejs";

type OfferPayload = {
  email?: string;
  namn?: string;
  offert_id?: string;
  pris?: number;
};

export async function POST(req: NextRequest) {
  console.log("📨 send-email triggered");

  try {
    // 🔐 ENV CHECK (fail fast)
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing RESEND_API_KEY");
      return Response.json(
        { success: false, error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // 📥 PARSE BODY SAFE
    let data: OfferPayload;

    try {
      data = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 🧠 VALIDATION
    if (!data?.email) {
      return Response.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const namn = data.namn ?? "kund";
    const offertId = data.offert_id ?? "unknown";
    const pris = data.pris ?? 0;

    // 📄 PDF GENERATION (safe)
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Fönsterputs Offert", 20, 20);

    doc.setFontSize(12);
    doc.text(`Offertnummer: ${offertId}`, 20, 40);
    doc.text(`Namn: ${namn}`, 20, 50);
    doc.text(`Email: ${data.email}`, 20, 60);
    doc.text(`Pris: ${pris} kr`, 20, 80);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // 📩 SEND EMAIL
    const result = await resend.emails.send({
      from: "Offertapp <onboarding@resend.dev>",
      to: data.email,
      subject: `Din offert ${offertId}`,
      html: `
        <h2>Fönsterputs Offert</h2>
        <p>Hej ${namn},</p>
        <p>Här är din offert.</p>
        <p><b>Pris:</b> ${pris} kr</p>
      `,
      attachments: [
        {
          filename: `offert-${offertId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("✅ Email sent:", result?.id);

    return Response.json({
      success: true,
      id: result?.id,
    });

  } catch (error: any) {
    console.error("❌ send-email error:", error);

    return Response.json(
      {
        success: false,
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("🔥 SEND EMAIL API HIT");

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 🔐 env check
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY in environment variables");
    }

    // 📦 parse request safely
    const data = await req.json();

    console.log("DATA:", data);

    if (!data?.email) {
      return Response.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    // 📄 PDF GENERATION
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Fönsterputs Offert", 20, 20);

    doc.setFontSize(12);
    doc.text(`Offertnummer: ${data.offert_id || "-"}`, 20, 40);
    doc.text(`Namn: ${data.namn || "-"}`, 20, 50);
    doc.text(`Email: ${data.email || "-"}`, 20, 60);
    doc.text(`Pris: ${data.pris || 0} kr`, 20, 80);

    const pdfArrayBuffer = doc.output("arraybuffer");

    // 📩 SEND EMAIL
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: `Din offert ${data.offert_id || ""}`,
      html: `
        <h1>Fönsterputs Offert</h1>
        <p>Hej ${data.namn || "kund"},</p>
        <p>Din offert är bifogad som PDF.</p>
        <p><b>Pris:</b> ${data.pris || 0} kr</p>
      `,
      attachments: [
        {
          filename: `offert-${data.offert_id || "unknown"}.pdf`,
          content: Buffer.from(pdfArrayBuffer),
        },
      ],
    });

    console.log("RESEND RESULT:", result);

    return Response.json({ success: true, result });

  } catch (error: unknown) {
    console.error("EMAIL ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
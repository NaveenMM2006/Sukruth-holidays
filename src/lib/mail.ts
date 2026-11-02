import nodemailer from "nodemailer";

type BookingMail = {
  kind: string;
  itemTitle: string;
  name: string;
  email: string;
  phone: string;
  travelDate?: string;
  travellers?: number;
  message?: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Emails the admin a new booking request. Returns false (never throws) if mail is not configured. */
export async function sendBookingEmail(b: BookingMail): Promise<boolean> {
  const { SMTP_USER, SMTP_PASS } = process.env;
  const to = process.env.BOOKING_NOTIFY_EMAIL || (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim();
  if (!SMTP_USER || !SMTP_PASS || !to) return false;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const rows: [string, string][] = [
      ["Request for", `${b.kind === "vehicle" ? "Vehicle" : "Package"}: ${b.itemTitle}`],
      ["Customer", b.name],
      ["Email", b.email],
      ["Mobile", b.phone],
      ["Travel date", b.travelDate || "Not specified"],
      ["Travellers", String(b.travellers ?? 1)],
      ["Message", b.message || "-"],
    ];
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px">
        <h2 style="color:#0C2B3D">New booking request</h2>
        <table style="width:100%;border-collapse:collapse">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#555">${k}</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(v)}</b></td></tr>`
            )
            .join("")}
        </table>
        <p style="color:#555">Call or WhatsApp the customer on ${esc(b.phone)}, or reply to this email.</p>
      </div>`;

    await transporter.sendMail({
      from: `Sukruth Holidays <${SMTP_USER}>`,
      to,
      replyTo: b.email,
      subject: `New booking request: ${b.itemTitle} (${b.name}, ${b.phone})`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Booking email failed:", err);
    return false;
  }
}

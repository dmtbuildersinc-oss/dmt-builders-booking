import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import type { BookingInput } from "@/lib/validation";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const wrapper = (bodyHtml: string) => `
<div style="background:${siteConfig.colors.warmWhite};padding:40px 16px;font-family:Georgia,'Playfair Display',serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${siteConfig.colors.gray};">
    <tr>
      <td style="background:${siteConfig.colors.navy};padding:32px 40px;text-align:center;">
        <p style="margin:0;color:${siteConfig.colors.gold};letter-spacing:3px;font-size:12px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">${siteConfig.company.name}</p>
        <p style="margin:6px 0 0;color:#ffffff;font-size:13px;font-family:Helvetica,Arial,sans-serif;">${siteConfig.company.tagline}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;font-family:Helvetica,Arial,sans-serif;color:${siteConfig.colors.text};font-size:15px;line-height:1.7;">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:${siteConfig.colors.warmWhite};text-align:center;font-family:Helvetica,Arial,sans-serif;">
        <p style="margin:0;font-size:12px;color:${siteConfig.colors.text}99;">
          ${siteConfig.company.name} &middot; ${siteConfig.company.tagline}
        </p>
        <p style="margin:6px 0 0;font-size:12px;">
          <a href="${siteConfig.company.website}" style="color:${siteConfig.colors.gold};text-decoration:none;">${siteConfig.company.website}</a>
        </p>
      </td>
    </tr>
  </table>
</div>`;

export async function sendClientConfirmationEmail(params: {
  booking: BookingInput;
  dateLabel: string;
  timeLabel: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping client confirmation email.");
    return;
  }
  const { booking, dateLabel, timeLabel } = params;

  const html = wrapper(`
    <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:22px;margin:0 0 20px;color:${siteConfig.colors.navy};">Consultation Confirmed</h1>
    <p style="margin:0 0 16px;">Thank you, ${booking.name}.</p>
    <p style="margin:0 0 16px;">Your consultation with ${siteConfig.company.owner} has been scheduled for:</p>
    <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:${siteConfig.colors.navy};">${dateLabel}</p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:${siteConfig.colors.gold};">${timeLabel} (Pacific Time)</p>
    <p style="margin:0 0 16px;">A calendar invitation has also been sent to this email address.</p>
    <p style="margin:0 0 16px;"><strong>Project:</strong> ${booking.projectTitle}<br/><strong>Address:</strong> ${booking.address}</p>
    <p style="margin:24px 0 0;">We look forward to discussing your project.</p>
    <p style="margin:20px 0 0;">&mdash; ${siteConfig.company.owner}<br/>${siteConfig.company.name}<br/>${siteConfig.company.tagline}</p>
  `);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "DMT Builders <onboarding@resend.dev>",
    to: booking.email,
    subject: `Consultation Confirmed — ${dateLabel} at ${timeLabel} PT`,
    html,
  });
}

export async function sendOwnerNotificationEmail(params: {
  booking: BookingInput;
  dateLabel: string;
  timeLabel: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping owner notification email.");
    return;
  }
  const { booking, dateLabel, timeLabel } = params;

  const html = wrapper(`
    <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:22px;margin:0 0 20px;color:${siteConfig.colors.navy};">New Consultation Booked</h1>
    <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:${siteConfig.colors.navy};">${dateLabel}</p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:${siteConfig.colors.gold};">${timeLabel} (Pacific Time)</p>
    <p style="margin:0 0 6px;"><strong>Client Name:</strong> ${booking.name}</p>
    <p style="margin:0 0 6px;"><strong>Phone:</strong> ${booking.phone}</p>
    <p style="margin:0 0 6px;"><strong>Email:</strong> ${booking.email}</p>
    <p style="margin:0 0 6px;"><strong>Project Address:</strong> ${booking.address}</p>
    <p style="margin:0 0 6px;"><strong>Project Title:</strong> ${booking.projectTitle}</p>
    <p style="margin:20px 0 0;">This event has been added to your Google Calendar with the client invited.</p>
  `);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "DMT Builders <onboarding@resend.dev>",
    to: siteConfig.company.ownerEmail,
    subject: `New Consultation — ${booking.projectTitle} (${dateLabel})`,
    html,
  });
}

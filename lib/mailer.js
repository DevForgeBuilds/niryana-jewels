// =====================================================================================
// Real SMTP email sending via Gmail (nodemailer), used for the Admin login OTP.
// Requires NODEMAILER_EMAIL (the Gmail address) and NODEMAILER_PASS (a Gmail App
// Password — not the account's normal login password; generate one at
// myaccount.google.com/apppasswords with 2-Step Verification turned on).
// =====================================================================================
import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  return transporter;
}

// Absolute URL to the brand logo so it renders correctly inside the email
// (relative paths don't resolve inside an email client).
const SITE_URL = (process.env.SITE_URL || "https://niryana-jewels-iota.vercel.app").replace(/\/$/, "");
const LOGO_URL = `${SITE_URL}/logo/niryana-logo-light.png`;

export async function sendPasswordResetInstructionsEmail(toEmail) {
  const t = getTransporter();

  await t.sendMail({
    from: `"Niryana Jewels Admin" <${process.env.NODEMAILER_EMAIL}>`,
    to: toEmail,
    subject: `How to reset your Niryana Jewels admin password`,
    text: `You (or someone) requested to reset the admin password for the Niryana Jewels dashboard. For security, the admin password is stored as an environment variable on Vercel, not in a database — so it can't be reset from this email directly. To change it: 1) Go to the Vercel dashboard, 2) Open the Niryana Jewels project, 3) Go to Settings > Environment Variables, 4) Update the value of ADMIN_PASSWORD, 5) Redeploy the project for the change to take effect. If you did not request this, you can safely ignore this email — no changes have been made.`,
    html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#EDE7DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE7DA; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow: 0 4px 24px rgba(31,61,50,0.12);">

            <!-- Header -->
            <tr>
              <td align="center" style="background:#1F3D32; padding: 36px 24px 28px;">
                <img src="${LOGO_URL}" alt="Niryana Jewels" width="160" style="display:block; width:160px; max-width:70%; height:auto; margin: 0 auto;" />
              </td>
            </tr>

            <!-- Gold divider -->
            <tr>
              <td style="height:3px; line-height:3px; font-size:0; background: linear-gradient(90deg, #1F3D32 0%, #C9A86A 50%, #1F3D32 100%);">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 36px 8px;">
                <p style="color:#C9A86A; letter-spacing: 3px; font-size: 11px; text-transform: uppercase; margin: 0 0 10px; text-align:center; font-family: Georgia, serif;">Admin Password Reset</p>
                <h1 style="color:#1F3D32; font-size: 22px; margin: 0 0 14px; text-align:center; font-weight: normal;">How to reset your password</h1>
                <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align:center;">
                  For security, the admin password isn&rsquo;t stored in a database — it lives as an environment
                  variable on Vercel. Follow these steps to change it:
                </p>
              </td>
            </tr>

            <!-- Steps -->
            <tr>
              <td style="padding: 0 36px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0; border: 1px solid #ECE4D0; border-radius: 10px;">
                  <tr><td style="padding: 18px 20px; font-size: 13.5px; color:#3A3A3A; line-height: 2;">
                    <strong style="color:#1F3D32;">1.</strong> Go to the <strong>Vercel dashboard</strong><br/>
                    <strong style="color:#1F3D32;">2.</strong> Open the <strong>Niryana Jewels</strong> project<br/>
                    <strong style="color:#1F3D32;">3.</strong> Go to <strong>Settings &rarr; Environment Variables</strong><br/>
                    <strong style="color:#1F3D32;">4.</strong> Update the value of <strong>ADMIN_PASSWORD</strong><br/>
                    <strong style="color:#1F3D32;">5.</strong> <strong>Redeploy</strong> the project for the change to take effect
                  </td></tr>
                </table>
              </td>
            </tr>

            <!-- Note -->
            <tr>
              <td style="padding: 0 36px 32px;">
                <p style="color:#8A8A7D; font-size: 12.5px; line-height: 1.6; margin: 0; text-align:center;">
                  If you did not request this, you can safely ignore this email — no changes have been made to your account.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#FAF7F0; padding: 20px 36px; border-top: 1px solid #ECE4D0;">
                <p style="color:#B3AA96; font-size: 11px; letter-spacing: 0.5px; margin: 0; text-align:center;">
                  Niryana Jewels &middot; Admin Dashboard Security<br/>
                  This is an automated message, please don't reply to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });
}

export async function sendOtpEmail(toEmail, otp) {
  const t = getTransporter();
  const digits = String(otp).split("");

  await t.sendMail({
    from: `"Niryana Jewels Admin" <${process.env.NODEMAILER_EMAIL}>`,
    to: toEmail,
    subject: `${otp} is your Niryana Jewels admin login code`,
    text: `Your admin login verification code is ${otp}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#EDE7DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE7DA; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow: 0 4px 24px rgba(31,61,50,0.12);">

            <!-- Header -->
            <tr>
              <td align="center" style="background:#1F3D32; padding: 36px 24px 28px;">
                <img src="${LOGO_URL}" alt="Niryana Jewels" width="160" style="display:block; width:160px; max-width:70%; height:auto; margin: 0 auto;" />
              </td>
            </tr>

            <!-- Gold divider -->
            <tr>
              <td style="height:3px; line-height:3px; font-size:0; background: linear-gradient(90deg, #1F3D32 0%, #C9A86A 50%, #1F3D32 100%);">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 36px 8px;">
                <p style="color:#C9A86A; letter-spacing: 3px; font-size: 11px; text-transform: uppercase; margin: 0 0 10px; text-align:center; font-family: Georgia, serif;">Admin Login Verification</p>
                <h1 style="color:#1F3D32; font-size: 22px; margin: 0 0 14px; text-align:center; font-weight: normal;">Your verification code</h1>
                <p style="color:#5B5B52; font-size: 14px; line-height: 1.6; margin: 0 0 28px; text-align:center;">
                  Someone requested a login to the <strong>Niryana Jewels</strong> admin dashboard using this email address.
                  Enter the code below to continue:
                </p>
              </td>
            </tr>

            <!-- OTP digits -->
            <tr>
              <td align="center" style="padding: 0 36px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    ${digits
                      .map(
                        (d) => `
                    <td style="width:44px; height:56px; background:#FAF7F0; border: 1.5px solid #C9A86A; border-radius: 8px; text-align:center; vertical-align:middle; font-size: 26px; font-weight:bold; color:#1F3D32; padding:0 4px;">
                      <div style="padding-top:2px;">${d}</div>
                    </td>
                    <td style="width:6px;">&nbsp;</td>`
                      )
                      .join("")}
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Expiry note -->
            <tr>
              <td style="padding: 0 36px 32px;">
                <p style="color:#8A8A7D; font-size: 12.5px; line-height: 1.6; margin: 0; text-align:center;">
                  This code expires in <strong style="color:#5B5B52;">10 minutes</strong>.<br/>
                  If you did not request this, you can safely ignore this email — your account is still secure.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#FAF7F0; padding: 20px 36px; border-top: 1px solid #ECE4D0;">
                <p style="color:#B3AA96; font-size: 11px; letter-spacing: 0.5px; margin: 0; text-align:center;">
                  Niryana Jewels &middot; Admin Dashboard Security<br/>
                  This is an automated message, please don't reply to this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });
}

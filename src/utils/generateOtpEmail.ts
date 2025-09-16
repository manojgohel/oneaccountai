/* eslint-disable @typescript-eslint/no-explicit-any */
// otpEmail.ts
export default function generateOtpEmail(newOTP: any, otpTTLMinutes = 15) {
    const brandName = "One Account AI";
    const domain = "OneAccountAI.com";
    const preheader = `Your ${brandName} OTP: ${newOTP} — valid for ${otpTTLMinutes} minutes.`;

    const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${brandName} OTP</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <!-- preheader: shows in inbox preview -->
    <div style="display:none;max-height:0;overflow:hidden;visibility:hidden;mso-hide:all;">
      ${preheader}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f6f8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(16,24,40,0.08);">
            <tr>
              <td style="padding:24px 28px 0; text-align:left;">
                <a href="https://${domain}" style="text-decoration:none;color:inherit;">
                  <h1 style="margin:0;font-size:20px;letter-spacing:0.2px;color:#0f172a;">
                    ${brandName}
                  </h1>
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;">
                <p style="margin:0;font-size:15px;color:#334155;">
                  You requested a one time passcode. Use the code below to continue.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 28px;">
                <!-- OTP container -->
                <div style="background:#0b69ff;border-radius:12px;padding:18px 24px;display:inline-block">
                  <span style="display:block;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace;
                               font-size:48px;line-height:1;color:#ffffff;letter-spacing:6px;">
                    ${newOTP}
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 24px;">
                <p style="margin:0;font-size:14px;color:#475569;">
                  This code is valid for <strong>${otpTTLMinutes} minutes</strong>. For your security, do not share this code with anyone.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <hr style="border:none;border-top:1px solid #eef2f7;margin:8px 0 16px;">
                <p style="margin:0;font-size:13px;color:#64748b;">
                  If you did not request this, you can safely ignore this email. Need help? Visit
                  <a href="https://${domain}" style="color:#0b69ff;text-decoration:none;">${domain}</a>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:16px 28px;text-align:center;font-size:12px;color:#9aa4b2;">
                © ${new Date().getFullYear()} ${brandName} • <a href="https://${domain}" style="color:#6b7280;text-decoration:none;">${domain}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

    const text = `${brandName} - One time passcode

Your ${brandName} OTP is: ${newOTP}

This OTP is valid for ${otpTTLMinutes} minutes.
Please do not share this OTP with anyone.

Visit: https://${domain}
`;

    return { html, text, subject: `${brandName} OTP: ${newOTP}` };
}

const brand = {
  name: process.env.EMAIL_FROM_NAME || "SalonOS",
  primary: "#111111",
  accent: "#f59e0b",
  bg: "#0b0b0c",
  panel: "#121214",
  text: "#f5f5f7",
  muted: "#9ca3af",
};

function baseLayout({ title, bodyHtml }) {
  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${title}</title>
      <style>
        @media (prefers-color-scheme: dark) { :root { color-scheme: dark; } }
      </style>
    </head>
    <body style="margin:0;padding:0;background:${brand.bg};font-family:Arial,Helvetica,sans-serif;color:${brand.text}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.bg};padding:32px 0">
        <tr>
          <td align="center">
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:${brand.panel};border-radius:16px;overflow:hidden;border:1px solid #1f2937">
              <tr>
                <td style="padding:24px 28px;border-bottom:1px solid #1f2937">
                  <div style="font-size:18px;font-weight:700;letter-spacing:.2px">${brand.name}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px">
                  ${bodyHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;border-top:1px solid #1f2937;color:${brand.muted};font-size:12px">
                  © ${new Date().getFullYear()} ${brand.name}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function button(href, label, color = brand.accent) {
  return `<a href="${href}" style="display:inline-block;padding:12px 18px;background:${color};color:#111;text-decoration:none;border-radius:10px;font-weight:700">${label}</a>`;
}

exports.passwordReset = function ({ resetLink }) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">Reset your password</h2>
    <p style="margin:0 0 18px;color:${brand.muted}">Choose a new password for your ${brand.name} account.</p>
    <div style="margin:14px 0 22px">${button(resetLink, "Reset Password")}</div>
    <p style="margin:0;color:${brand.muted}">If the button doesn’t work, copy and paste this link:</p>
    <p style="margin:8px 0 0;word-break:break-all"><a href="${resetLink}" style="color:${brand.text}">${resetLink}</a></p>
    <p style="margin:16px 0 0;color:${brand.muted};font-size:12px">Link expires in 1 hour.</p>
  `;
  return baseLayout({ title: "Reset your password", bodyHtml: body });
};

exports.welcome = function ({ loginUrl = "https://salonos.ai/login" }) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">Welcome to ${brand.name}</h2>
    <p style="margin:0 0 18px;color:${brand.muted}">Your account is ready. Access your dashboard now.</p>
    <div style="margin:14px 0 22px">${button(loginUrl, "Open Dashboard", "#10b981")}</div>
    <p style="margin:0;color:${brand.muted};font-size:12px">Need help? Reply to this email.</p>
  `;
  return baseLayout({ title: "Welcome", bodyHtml: body });
};



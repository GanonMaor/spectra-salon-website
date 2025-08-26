const brand = {
  name: process.env.EMAIL_FROM_NAME || "SalonOS",
  primary: "#111111",
  accent: "#f59e0b",
  accentGrad: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  bg: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
  panel: "rgba(31, 41, 55, 0.95)",
  panelBorder: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  textSecondary: "#e5e7eb",
  muted: "#9ca3af",
  shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
  shadowSoft: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

function baseLayout({ title, bodyHtml }) {
  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @media (prefers-color-scheme: dark) { :root { color-scheme: dark; } }
        .glass-panel { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .hover-lift:hover { transform: translateY(-2px); transition: transform 0.2s ease; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; margin: 16px !important; }
          .panel { border-radius: 12px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:${brand.bg};font-family:'Inter',system-ui,-apple-system,sans-serif;color:${brand.text};line-height:1.6">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.bg};padding:40px 20px;min-height:100vh">
        <tr>
          <td align="center">
            <table role="presentation" class="container" width="580" cellspacing="0" cellpadding="0" style="background:${brand.panel};border-radius:20px;overflow:hidden;border:1px solid ${brand.panelBorder};box-shadow:${brand.shadow};backdrop-filter:blur(20px)">
              <tr>
                <td style="padding:32px 36px;border-bottom:1px solid ${brand.panelBorder};background:rgba(255,255,255,0.05)">
                  <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:${brand.text}">${brand.name}</div>
                  <div style="font-size:11px;color:${brand.textSecondary};margin-top:2px;text-transform:uppercase;letter-spacing:0.5px">Professional Salon Management</div>
                </td>
              </tr>
              <tr>
                <td style="padding:36px">
                  ${bodyHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 36px;border-top:1px solid ${brand.panelBorder};background:rgba(0,0,0,0.3);color:${brand.textSecondary};font-size:11px;text-align:center">
                  <div style="margin-bottom:8px">© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</div>
                  <div style="color:${brand.muted}">Powered by advanced AI color technology</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function button(href, label, gradient = brand.accentGrad) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0">
    <tr>
      <td style="border-radius:12px;background:${gradient};box-shadow:${brand.shadowSoft}">
        <a href="${href}" style="display:inline-block;padding:14px 28px;color:#111;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:-0.01em;border-radius:12px;transition:all 0.2s ease">${label}</a>
      </td>
    </tr>
  </table>`;
}

exports.passwordReset = function ({ resetLink }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="width:64px;height:64px;background:${brand.accentGrad};border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;box-shadow:${brand.shadowSoft}">
        <div style="font-size:28px">🔐</div>
      </div>
    </div>
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;letter-spacing:-0.02em;text-align:center">Reset your password</h1>
    <p style="margin:0 0 24px;color:${brand.textSecondary};font-size:16px;text-align:center;line-height:1.5">We received a request to reset your password. Click the button below to create a new one.</p>
    
    ${button(resetLink, "Reset Password →")}
    
    <div style="background:rgba(255,255,255,0.08);border:1px solid ${brand.panelBorder};border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px;color:${brand.text};font-size:13px;font-weight:500">Alternative access:</p>
      <p style="margin:0;word-break:break-all;font-size:12px"><a href="${resetLink}" style="color:${brand.textSecondary};text-decoration:none">${resetLink}</a></p>
    </div>
    
    <div style="text-align:center;margin-top:32px">
      <p style="margin:0;color:${brand.muted};font-size:13px">⏰ This link expires in 1 hour</p>
      <p style="margin:8px 0 0;color:${brand.muted};font-size:12px">Didn't request this? You can safely ignore this email.</p>
    </div>
  `;
  return baseLayout({ title: "Reset your password", bodyHtml: body });
};

exports.welcome = function ({ loginUrl = "https://salonos.ai/login" }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="width:64px;height:64px;background:${brand.success};border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;box-shadow:${brand.shadowSoft}">
        <div style="font-size:28px">🎉</div>
      </div>
    </div>
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;letter-spacing:-0.02em;text-align:center">Welcome to ${brand.name}</h1>
    <p style="margin:0 0 24px;color:${brand.textSecondary};font-size:16px;text-align:center;line-height:1.5">Your professional salon management account is ready. Start optimizing your color processes today.</p>
    
    ${button(loginUrl, "Open Dashboard →", brand.success)}
    
    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin:24px 0">
      <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:${brand.text}">🚀 Quick Start Guide</h3>
      <ul style="margin:0;padding-left:20px;color:${brand.textSecondary};font-size:14px;line-height:1.6">
        <li>Set up your color inventory</li>
        <li>Configure client profiles</li>
        <li>Start tracking formulations</li>
      </ul>
    </div>
    
    <div style="text-align:center;margin-top:32px">
      <p style="margin:0;color:${brand.muted};font-size:13px">Need help getting started? Reply to this email.</p>
    </div>
  `;
  return baseLayout({ title: "Welcome to SalonOS", bodyHtml: body });
};



/**
 * Vercel Serverless Function — Lead Capture
 *
 * POST /api/send-lead
 *
 * Body: {
 *   name: string,
 *   email: string,
 *   company?: string,
 *   phone?: string,
 *   module?: string,         // Which feature triggered the lead
 *   message?: string,
 *   companySize?: string,
 *   teamCount?: string,
 *   sourceUrl?: string,      // Where the user submitted from
 * }
 *
 * Sends email to t.ficek@gmail.com via Resend.
 *
 * ENV VARS (set in Vercel project settings):
 * - RESEND_API_KEY (server-side only, NOT exposed to browser)
 * - LEAD_TO_EMAIL (default: t.ficek@gmail.com)
 */

import { Resend } from 'resend';

interface LeadPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  module?: string;
  message?: string;
  companySize?: string;
  teamCount?: string;
  sourceUrl?: string;
}

interface VercelRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  end: (body?: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — allow any origin (or restrict to your domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body (Vercel auto-parses JSON if Content-Type is application/json)
  let payload: LeadPayload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Validate required fields
  if (!payload?.name || !payload?.email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_TO_EMAIL || 't.ficek@gmail.com';

  if (!apiKey) {
    console.error('[send-lead] RESEND_API_KEY missing in env');
    return res.status(500).json({ error: 'Server email not configured' });
  }

  const resend = new Resend(apiKey);

  // Build the email
  const subject = payload.module
    ? `Novy dopyt z DE Demo: ${payload.module}`
    : `Novy dopyt z DE Demo`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #c97645; font-size: 24px; margin-bottom: 8px; }
        .module { display: inline-block; background: #fef3e8; color: #c97645; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 16px; }
        .field { margin: 12px 0; padding: 12px; background: #f9f9f9; border-radius: 6px; }
        .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
        .field-value { font-size: 15px; color: #1a1a1a; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        .cta { display: inline-block; background: #c97645; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 8px 4px 0 0; }
      </style>
    </head>
    <body>
      <h1>Novy lead z Demo</h1>
      ${payload.module ? `<div class="module">Modul: ${escapeHtml(payload.module)}</div>` : ''}

      <div class="field">
        <div class="field-label">Meno</div>
        <div class="field-value"><strong>${escapeHtml(payload.name)}</strong></div>
      </div>

      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></div>
      </div>

      ${payload.company ? `
      <div class="field">
        <div class="field-label">Firma</div>
        <div class="field-value">${escapeHtml(payload.company)}</div>
      </div>` : ''}

      ${payload.phone ? `
      <div class="field">
        <div class="field-label">Telefon</div>
        <div class="field-value"><a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a></div>
      </div>` : ''}

      ${payload.companySize ? `
      <div class="field">
        <div class="field-label">Velkost firmy</div>
        <div class="field-value">${escapeHtml(payload.companySize)}</div>
      </div>` : ''}

      ${payload.teamCount ? `
      <div class="field">
        <div class="field-label">Pocet ludi v HR / podpornom time</div>
        <div class="field-value">${escapeHtml(payload.teamCount)}</div>
      </div>` : ''}

      ${payload.message ? `
      <div class="field">
        <div class="field-label">Sprava</div>
        <div class="field-value" style="white-space: pre-wrap;">${escapeHtml(payload.message)}</div>
      </div>` : ''}

      <div style="margin-top: 24px;">
        <a href="mailto:${escapeHtml(payload.email)}?subject=Re: Demo HR platforma" class="cta">Odpovedat</a>
        ${payload.phone ? `<a href="tel:${escapeHtml(payload.phone)}" class="cta">Zavolat</a>` : ''}
      </div>

      <div class="footer">
        <p>Odoslane ${new Date().toLocaleString('sk-SK')} z Digital Evolution Demo platformy.</p>
        ${payload.sourceUrl ? `<p>Zdroj: ${escapeHtml(payload.sourceUrl)}</p>` : ''}
      </div>
    </body>
    </html>
  `;

  // Plain-text fallback
  const text = `Novy dopyt z DE Demo
${payload.module ? `Modul: ${payload.module}\n` : ''}
Meno: ${payload.name}
Email: ${payload.email}
${payload.company ? `Firma: ${payload.company}\n` : ''}${payload.phone ? `Telefon: ${payload.phone}\n` : ''}${payload.companySize ? `Velkost firmy: ${payload.companySize}\n` : ''}${payload.teamCount ? `Tim: ${payload.teamCount}\n` : ''}${payload.message ? `\nSprava:\n${payload.message}\n` : ''}
---
Odoslane: ${new Date().toLocaleString('sk-SK')}
${payload.sourceUrl ? `Zdroj: ${payload.sourceUrl}` : ''}`;

  try {
    const result = await resend.emails.send({
      // 'onboarding@resend.dev' is a default Resend test address (works without domain verification)
      // Once you verify digitalevolution.sk in Resend, change to e.g. 'demo@digitalevolution.sk'
      from: process.env.LEAD_FROM_EMAIL || 'DE Demo <onboarding@resend.dev>',
      to: [toEmail],
      replyTo: payload.email,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error('[send-lead] Resend error:', result.error);
      return res.status(500).json({ error: 'Email send failed', detail: result.error.message });
    }

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (e: any) {
    console.error('[send-lead] Unexpected error:', e);
    return res.status(500).json({ error: 'Internal server error', detail: e?.message });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

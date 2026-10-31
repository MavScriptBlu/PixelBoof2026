import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SYSTEM_INSTRUCTION = `You are PixelBot, the official AI Arcade Coach & Tech-Con Booth Assistant for PixelBoof at Mid-State Technical College (MSTC) on November 13th.
Keep all responses short (under 75 words) to save tokens and keep the booth line moving fast!
1. Help students brainstorm fun, vivid prompts for transforming their photos or creating die-cut stickers.
2. Recommend lenses from PixelBoof's 6 grouped categories (Arcade, RPG/Fantasy, Action/Sci-Fi, Fursona, Cards/Toons, Pride/Duos).
3. Remind students of the 3-sticker limit (Max 3/3) tagged with their Full Name & High School for the Cricut Joy Xtra.
4. When suggesting a custom sticker prompt, wrap the exact prompt in double quotes so the student can click to generate it.`;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '35mb' }));

  // Create or edit images (locked to 1K resolution to protect event budget)
  app.post('/api/generate-sticker', async (req, res) => {
    try {
      const {
        prompt,
        inputFile,
        model = 'gemini-nano-banana-2.1',
        aspectRatio = '1:1',
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          fallbackRequired: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const parts = [];

      if (inputFile && typeof inputFile === 'string' && inputFile.includes(',')) {
        const mimeMatch = inputFile.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = inputFile.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }
      parts.push({ text: String(prompt).slice(0, 600) });

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: '1K', // Hard-capped at 1K to prevent high-res cost spikes at Tech-Con
          },
        },
      });

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      let imageUrl = null;
      let AccompanyingText = '';

      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          AccompanyingText += part.text;
        }
      }

      if (!imageUrl) {
        return res.status(502).json({
          error: 'No image data returned from Gemini model.',
          fallbackRequired: true,
        });
      }

      return res.json({
        imageUrl,
        text: AccompanyingText,
        modelUsed: model,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Unknown generation error';
      console.error('Server-side Gemini image generation error:', errMessage);
      return res.status(500).json({
        error: errMessage,
        fallbackRequired: true,
      });
    }
  });

  // Stateless in-memory Gmail batch endpoint: sends attendee's 3-sticker ZIP batch using Gmail API (OAuth Bearer token) or Gmail SMTP
  app.post('/api/email-sticker-batch', async (req, res) => {
    try {
      const {
        attendeeName = 'Attendee',
        attendeeSchool = 'TechCon',
        zipBase64,
        fileName = 'PixelBoof_Stickers.zip',
        stickerCount = 1,
        fallbackRecipient = '',
      } = req.body;

      if (!zipBase64 || typeof zipBase64 !== 'string') {
        return res.status(400).json({ error: 'Missing sticker ZIP data.' });
      }

      const recipientEmail =
        process.env.ORGANIZER_EMAIL ||
        process.env.GMAIL_USER ||
        fallbackRecipient ||
        'mavscriptblue@gmail.com';
      const cleanBase64 = zipBase64.includes(',')
        ? zipBase64.split(',')[1]
        : zipBase64;
      const zipBuffer = Buffer.from(cleanBase64, 'base64');

      const subject = `[PixelBoof Tech-Con] ${attendeeName} (${attendeeSchool}) — ${stickerCount} Sticker(s)`;
      const htmlBody = `
        <div style="font-family: monospace; background: #140f1d; color: #f7f7f7; padding: 20px; border: 3px solid #ffcc00;">
          <h2 style="color: #ffcc00; margin-top: 0;">PIXEL BOOF — ATTENDEE STICKER BATCH</h2>
          <p><strong>Attendee Name:</strong> ${attendeeName}</p>
          <p><strong>High School:</strong> ${attendeeSchool}</p>
          <p><strong>Queued Stickers:</strong> ${stickerCount} / 3</p>
          <p><strong>Attached File:</strong> <code>${fileName}</code></p>
          <hr style="border-color: #8B1E41;" />
          <p style="font-size: 11px; color: #cbd5e1;">Sent statelessly in-memory from PixelBoof via Gmail. Zero images are stored on the server.</p>
        </div>
      `;

      // Path 1: Gmail REST API using the client's Google OAuth Bearer token (https://www.googleapis.com/auth/gmail.send)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const mimeTransporter = nodemailer.createTransport({
          streamTransport: true,
          buffer: true,
          newline: 'unix',
        });

        const compiledMime = await mimeTransporter.sendMail({
          to: recipientEmail,
          subject,
          html: htmlBody,
          attachments: [
            {
              filename: fileName,
              content: zipBuffer,
              contentType: 'application/zip',
            },
          ],
        });

        const rawBuffer = Buffer.isBuffer(compiledMime.message)
          ? compiledMime.message
          : Buffer.from(String(compiledMime.message));
        const encodedMessage = rawBuffer
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const gmailRes = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              raw: encodedMessage,
            }),
          }
        );

        if (!gmailRes.ok) {
          const errBody = await gmailRes.text();
          console.error('Gmail API error:', gmailRes.status, errBody);
          return res.status(gmailRes.status).json({
            ok: false,
            needsAuth: gmailRes.status === 401 || gmailRes.status === 403,
            error: 'Gmail authorization expired or failed. Please sign in with Google again.',
          });
        }

        const gmailData = await gmailRes.json();
        return res.json({
          ok: true,
          recipientEmail,
          transport: 'gmail-api',
          messageId: gmailData.id,
          message: `Sent ${fileName} to ${recipientEmail} via Gmail!`,
        });
      }

      // Path 2: Server-side Gmail SMTP if GMAIL_APP_PASSWORD (or SMTP_PASS) is configured in environment
      const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
      if (gmailPass) {
        const gmailUser =
          process.env.GMAIL_USER ||
          process.env.SMTP_USER ||
          recipientEmail;

        const gmailSmtpTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await gmailSmtpTransporter.sendMail({
          from: `"PixelBoof Booth" <${gmailUser}>`,
          to: recipientEmail,
          subject,
          html: htmlBody,
          attachments: [
            {
              filename: fileName,
              content: zipBuffer,
              contentType: 'application/zip',
            },
          ],
        });

        return res.json({
          ok: true,
          recipientEmail,
          transport: 'gmail-smtp',
          message: `Sent ${fileName} to ${recipientEmail} via Gmail!`,
        });
      }

      // Path 3: Zero-config relay fallback when GMAIL_APP_PASSWORD is not set yet in environment
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"PixelBoof Booth" <${testAccount.user}>`,
        to: recipientEmail,
        subject,
        html: htmlBody,
        attachments: [
          {
            filename: fileName,
            content: zipBuffer,
            contentType: 'application/zip',
          },
        ],
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      return res.json({
        ok: true,
        recipientEmail,
        transport: 'relay',
        previewUrl,
        message: `Sent ${fileName} to ${recipientEmail}!`,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Failed to send sticker batch via Gmail';
      console.error('Gmail batch error:', errMessage);
      return res.status(500).json({
        ok: false,
        error: errMessage,
        recipientEmail:
          process.env.ORGANIZER_EMAIL || 'mavscriptblue@gmail.com',
      });
    }
  });

  // Multi-turn Gemini Chatbot endpoint — strictly restricted to budget-friendly Flash Lite & Flash models (NO Argon!)
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        model = 'gemini-3.1-flash-lite',
        systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
      } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const allowedModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      const selectedModel = allowedModels.includes(model)
        ? model
        : 'gemini-3.1-flash-lite';

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
      const formattedHistory = recentHistory
        .filter(
          msg =>
            (msg?.role === 'user' || msg?.role === 'model') &&
            typeof msg?.text === 'string' &&
            msg.text.trim() !== ''
        )
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text.slice(0, 500) }],
        }));

      const chat = ai.chats.create({
        model: selectedModel,
        history: formattedHistory,
        config: {
          systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel:
              selectedModel === 'gemini-3.1-flash-lite'
                ? ThinkingLevel.MINIMAL
                : ThinkingLevel.LOW,
          },
        },
      });

      const response = await chat.sendMessage({
        message: message.slice(0, 400),
      });

      return res.json({
        reply:
          response.text ||
          'Ready to help you craft some awesome pixel stickers!',
        modelUsed: selectedModel,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Unknown chat error';
      console.error('Server-side Gemini chat error:', errMessage);
      return res.status(500).json({
        error: errMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PixelBoof server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

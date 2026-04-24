import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sendWhatsAppMessage } from '../src/utils/sendWhatsApp';

// Pequeno servidor de preview que expõe uma página estática e uma API
// para demonstrar o envio usando a função sendWhatsAppMessage (Puppeteer).

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PREVIEW_PORT = Number(process.env.PREVIEW_PORT || 3000);
const userDataDir = process.env.WHATSAPP_USERDATA_DIR || path.join(process.cwd(), 'whatsapp-session');
const headless = process.env.HEADLESS === 'true';

// Serve os arquivos de preview neste diretório
app.use('/', express.static(path.join(__dirname)));

app.post('/api/send-whatsapp', async (req, res) => {
  const { phone, message } = req.body as { phone?: string; message?: string };
  if (!phone || !message) return res.status(400).json({ ok: false, error: 'phone and message are required' });

  try {
    const result = await sendWhatsAppMessage(phone, message, {
      userDataDir,
      headless,
      closeAfterSend: false,
    });
    if (result.success) return res.json({ ok: true });
    return res.status(500).json({ ok: false, error: result.error });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

app.listen(PREVIEW_PORT, () => {
  console.log(`Preview server rodando em http://localhost:${PREVIEW_PORT}`);
  console.log(`userDataDir=${userDataDir} | headless=${headless}`);
});

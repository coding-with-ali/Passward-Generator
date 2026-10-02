import { Router, Request, Response } from 'express';
import { isValidEmail } from '../utils';

const router = Router();

// POST /api/contact
router.post('/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  if (!isValidEmail(String(email))) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  console.log('📩 New contact message:', {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    subject: subject ? String(subject).trim() : '(no subject)',
    message: String(message).trim(),
    at: new Date().toISOString(),
  });
  return res.json({ ok: true, message: "Thank you for reaching out! We'll get back to you soon." });
});

export default router;

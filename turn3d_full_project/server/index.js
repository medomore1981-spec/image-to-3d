require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const multer = require('multer');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const app = express();
app.use(express.json());

// connect to MongoDB if provided
if(process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(e=>console.error('MongoDB error', e));
}

// uploads folder
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, UPLOAD_DIR),
  filename: (req,file,cb)=>cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req,res)=>{
  try{
    const file = req.file;
    const note = req.body.note || '';
    const email = req.body.email || '';
    const fileUrl = `/uploads/${file.filename}`;
    // in production save record to DB
    res.json({ ok:true, fileUrl });
  }catch(err){
    console.error(err);
    res.status(500).json({ ok:false });
  }
});

app.post('/register-basic', express.json(), (req,res)=>{
  const { email, note, original } = req.body;
  // save to DB if needed
  sendOrderEmail({ to: process.env.OWNER_EMAIL, clientEmail: email, plan: 'Basic', note, original });
  res.json({ ok:true });
});

app.post('/create-checkout-session', express.json(), async (req,res)=>{
  const { priceId, email, note, original } = req.body;
  try{
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: process.env.CLIENT_SUCCESS_URL || 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CLIENT_CANCEL_URL || 'http://localhost:3000/cancel'
    });
    // store simple mapping
    const sessionsDir = path.join(__dirname, 'sessions');
    if(!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
    fs.writeFileSync(path.join(sessionsDir, session.id + '.json'), JSON.stringify({ email, note, original }));
    res.json({ sessionId: session.id, url: session.url });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// static serve uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req,res)=>{
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(e){
    console.error('Webhook signature failed', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
  console.log('Webhook event', event.type);
  if(event.type === 'checkout.session.completed'){
    (async ()=>{
      const session = event.data.object;
      const sessionsDir = path.join(__dirname, 'sessions');
      const sessionFile = path.join(sessionsDir, session.id + '.json');
      let meta = {};
      if(fs.existsSync(sessionFile)) meta = JSON.parse(fs.readFileSync(sessionFile));
      await sendOrderEmail({ to: process.env.OWNER_EMAIL, clientEmail: meta.email || session.customer_email, plan: 'Paid', note: meta.note, original: meta.original, sessionId: session.id });
    })();
  }
  res.json({ received:true });
});

// simple email sender
async function sendOrderEmail({ to, clientEmail, plan, note, original, sessionId }){
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const html = `<h2>New Order</h2><p><strong>Client:</strong> ${clientEmail}</p><p><strong>Plan:</strong> ${plan}</p><p><strong>Note:</strong> ${note || '—'}</p><p><strong>Original:</strong> ${original || '—'}</p><p><strong>Session:</strong> ${sessionId || '—'}</p>`;
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject: `New order — ${plan}`, html });
    console.log('Email sent to', to);
  }catch(err){
    console.error('Email error', err);
  }
}

const PORT = process.env.PORT || 4242;
app.listen(PORT, ()=>console.log('Server running on', PORT));

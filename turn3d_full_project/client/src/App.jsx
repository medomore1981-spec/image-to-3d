import React, { useState } from 'react';
import Home from './pages/Home';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export default function App(){
  const [user, setUser] = useState(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  function handleLogin(e){
    e.preventDefault();
    const email = e.target.email.value;
    setUser({ email });
  }

  function onFile(e){
    setFile(e.target.files[0]);
  }

  async function uploadOriginal(){
    if(!file) { setStatus('Please upload image first'); return null;}
    setStatus('Uploading original...');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('note', note);
    fd.append('email', user?.email || '');
    const res = await fetch('/upload', { method:'POST', body: fd });
    if(!res.ok){ setStatus('Upload failed'); return null; }
    const json = await res.json();
    setStatus('Original uploaded');
    return json;
  }

  async function handleCheckout(priceKey){
    if(!user){ setStatus('Please login first'); return; }
    const orig = await uploadOriginal();
    if(priceKey === 'basic'){
      await fetch('/register-basic', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:user.email, note, original: orig?.fileUrl || null })});
      setStatus('Registered Basic');
      return;
    }
    setStatus('Creating checkout session...');
    const priceId = priceKey === 'standard' ? process.env.REACT_APP_STRIPE_PRICE_STANDARD : process.env.REACT_APP_STRIPE_PRICE_PREMIUM;
    const res = await fetch('/create-checkout-session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ priceId, email:user.email, note, original: orig?.fileUrl || null })});
    const data = await res.json();
    if(data.sessionId){
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if(error) setStatus(error.message);
    } else {
      setStatus('Checkout failed');
    }
  }

  return (
    <div>
      <header style={{background:'#fff', color:'#000', padding:12, display:'flex',justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'#0672ff'}}>You Turn To 3D</h1>
        <div>
          {user ? (
            <span>{user.email} <button onClick={()=>setUser(null)}>Logout</button></span>
          ) : (
            <a href="#login">Login</a>
          )}
        </div>
      </header>

      <main style={{padding:20}}>
        {!user ? (
          <section id="login" style={{maxWidth:420, margin:'20px auto', background:'#11131a', padding:20, borderRadius:8}}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}><input name="email" placeholder="Email" /><br/><input name="password" type="password" placeholder="Password" /><br/><button type="submit">Login</button></form>
          </section>
        ) : (
          <section id="upload" style={{maxWidth:900, margin:'20px auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div style={{background:'#11131a', padding:20, borderRadius:8}}>
              <h2>Upload & Brief</h2>
              <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Brief..." style={{width:'100%', minHeight:100}} />
              <input type="file" accept="image/*" onChange={onFile} />
              <div style={{marginTop:12}}>
                <button onClick={()=>handleCheckout('basic')} style={{marginRight:6}}>Basic — Free</button>
                <button onClick={()=>handleCheckout('standard')} style={{marginRight:6}}>Standard — $25/mo</button>
                <button onClick={()=>handleCheckout('premium')}>Premium — $50/mo</button>
              </div>
              <p>{status}</p>
            </div>
            <div style={{background:'#0f1724', padding:20, borderRadius:8}}>
              <h3>Preview</h3>
              {file ? <img src={URL.createObjectURL(file)} alt="preview" style={{maxWidth:'100%'}} /> : <img src="https://i.pinimg.com/originals/10/87/97/1087971222500103707.jpg" alt="before" style={{maxWidth:'100%'}} />}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

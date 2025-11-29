import React from 'react';

export default function Home(){
  return (
    <div>
      <div className="top-banner" style={{position:'relative',width:'100%',background:'#ffffff',display:'flex',justifyContent:'center',alignItems:'center',gap:15,padding:'20px 0',flexWrap:'wrap',borderBottom:'4px solid #e6e6e6'}}>
        <div style={{position:'absolute',top:10,width:'100%',textAlign:'center',color:'#0672ff',fontSize:26,fontWeight:'bold',padding:'10px 0',textShadow:'0 0 3px rgba(255,255,255,0.8)'}}>You Turn To 3d</div>
        <img src="https://i.pinimg.com/1200x/9e/63/c6/9e63c62409bffe57d2de795c9cf748ab.jpg" alt="Left" style={{width:'45%',height:'auto',maxHeight:360,objectFit:'contain',borderRadius:10}} />
        <img src="https://i.pinimg.com/1200x/d9/d0/65/d9d0653063929a0ed530f0318658d872.jpg" alt="Right" style={{width:'45%',height:'auto',maxHeight:360,objectFit:'contain',borderRadius:10}} />
      </div>

      <div className="hero" style={{padding:'90px 20px',background:'linear-gradient(135deg, #1b1f3b, #080a12)',textAlign:'center',color:'#76d9ff'}}>
        <h1 style={{fontSize:42,marginBottom:15,fontWeight:'bold',color:'#76d9ff'}}>Turn Your Photo into an Amazing 3D Character</h1>
        <p style={{fontSize:18,opacity:0.85,color:'#d8e9ff'}}>Upload your photo and let AI create a 3D model that moves and presents your content.</p>
        <a className="cta-btn" href="#upload" style={{padding:'15px 40px',background:'#00e0ff',color:'black',fontSize:18,marginTop:30,borderRadius:12,textDecoration:'none',display:'inline-block',transition:'0.3s',fontWeight:'bold'}}>Get Started</a>
      </div>

      <section id="upload" style={{padding:'60px 20px',textAlign:'center'}}>
        <h2 style={{color:'#76d9ff',fontSize:32}}>✨ Upload Your Photo</h2>
        <p style={{color:'#d8e9ff'}}>Select a clear photo — we’ll handle the rest!</p>

        <div className="upload-box" style={{margin:'30px auto',width:330,padding:30,background:'#11131a',borderRadius:12,border:'1px solid #2d3348',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
          <input type="file" disabled style={{marginTop:20,padding:10,width:'100%',background:'#0c0d12',color:'white',border:'1px solid #444a60',borderRadius:8}} />
          <p id="status"></p>
          <button className="cta-btn" style={{padding:'15px 40px',background:'#00e0ff',color:'black',fontSize:18,marginTop:30,borderRadius:12,textDecoration:'none',display:'inline-block',transition:'0.3s',fontWeight:'bold',border:'none'}}>Start Conversion</button>
        </div>

        <div className="image-preview" style={{margin:'20px auto',display:'flex',justifyContent:'center',gap:20,flexWrap:'wrap'}}>
          <div>
            <h3>Before</h3>
            <img id="beforeImage" src="https://i.pinimg.com/originals/10/87/97/1087971222500103707.jpg" alt="Before Image" style={{maxWidth:300,borderRadius:12,border:'2px solid #2f3a55',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}} />
          </div>
          <div>
            <h3>After</h3>
            <img id="afterImage" alt="After Image" style={{maxWidth:300,borderRadius:12,border:'2px solid #2f3a55',boxShadow:'0 4px 12px rgba(0,0,0,0.4)',opacity:0.7}} />
          </div>
        </div>
      </section>
    </div>
  );
}

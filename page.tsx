 "use client";
import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "@/lib/supabase";

type Project = { id:string; title:string; company_name:string; category:string; description:string; budget:number; status:string; created_at:string };
type Profile = { id:string; full_name:string|null; role:string; verification_status:string };

export default function Home() {
  const [session,setSession] = useState<any>(null);
  const [profile,setProfile] = useState<Profile|null>(null);
  const [projects,setProjects] = useState<Project[]>([]);
  const [page,setPage] = useState("overview");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [authMode,setAuthMode] = useState<"login"|"signup">("signup");

  async function load() {
    if (!supabase) return;
    const {data:{session}} = await supabase.auth.getSession();
    setSession(session);
    if(session?.user) {
      const {data:p} = await supabase.from("profiles").select("*").eq("id",session.user.id).maybeSingle();
      setProfile(p as Profile|null);
    }
    const {data} = await supabase.from("projects").select("*").eq("status","open").order("created_at",{ascending:false}).limit(30);
    setProjects((data||[]) as Project[]);
  }
  useEffect(()=>{ load(); if(!supabase)return; const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>load()); return ()=>subscription.unsubscribe(); },[]);

  async function auth(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if(!supabase)return;
    setBusy(true);setMessage("");
    const f=new FormData(e.currentTarget); const email=String(f.get("email")); const password=String(f.get("password"));
    if(authMode==="signup") {
      const name=String(f.get("name")); const role=String(f.get("role"));
      const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,role}}});
      setMessage(error?.message || "Account created. Check your email if confirmation is enabled.");
    } else {
      const {error}=await supabase.auth.signInWithPassword({email,password});
      setMessage(error?.message || "Signed in.");
    }
    setBusy(false); await load();
  }
  async function signOut(){await supabase?.auth.signOut();setSession(null);setProfile(null);setPage("overview");}
  async function postProject(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(!supabase||!session)return;setBusy(true);setMessage("");
    const f=new FormData(e.currentTarget);
    const payload={owner_id:session.user.id,title:String(f.get("title")),company_name:String(f.get("company")),category:String(f.get("category")),description:String(f.get("description")),budget:Number(f.get("budget")),duration:String(f.get("duration")),work_mode:String(f.get("work_mode")),required_skills:String(f.get("skills")).split(",").map(x=>x.trim()).filter(Boolean),status:"open"};
    const {error}=await supabase.from("projects").insert(payload);
    setMessage(error?.message||"Project published. Matching and notifications can be enabled after the automation provider is connected.");
    setBusy(false);(e.currentTarget as HTMLFormElement).reset();await load();
  }
  async function submitProposal(e:React.FormEvent<HTMLFormElement>,projectId:string){
    e.preventDefault();if(!supabase||!session)return;setBusy(true);
    const f=new FormData(e.currentTarget);
    const {error}=await supabase.from("proposals").insert({project_id:projectId,marketer_id:session.user.id,price:Number(f.get("price")),delivery_days:Number(f.get("days")),cover_message:String(f.get("message")),status:"submitted"});
    setMessage(error?.message||"Proposal submitted.");setBusy(false);await load();
  }

  if(!supabaseReady) return <div className="wrap"><div className="card" style={{maxWidth:680,margin:"8vh auto"}}><div className="eyebrow">MARKETBRIDGE · SETUP REQUIRED</div><h1>Connect your Supabase project</h1><p className="muted">The app is ready for a shared database. Add the two public Supabase values in Replit Secrets, then run the SQL file included in this project.</p><div className="notice">Required secrets: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Never put a service-role key in browser code.</div><p>See <b>README.md</b> for setup instructions.</p></div></div>;

  return <div className="shell">
    <aside className="side"><div className="brand">Market<span>Bridge</span></div><nav className="nav">
      {["overview","projects","post-project","proposals","verification","trust","payments"].map(x=><a href="#" className={page===x?"active":""} onClick={e=>{e.preventDefault();setPage(x)}} key={x}>{({overview:"▦ Overview",projects:"◫ Browse projects","post-project":"＋ Post a project",proposals:"▤ My proposals",verification:"▣ Verification",trust:"✓ Trust & safety",payments:"₹ Payments"} as any)[x]}</a>)}
    </nav></aside>
    <main><header className="top"><b>{session ? (profile?.full_name||session.user.email) : "Marketplace preview"}</b><div className="row">{session?<><span className="tag">{profile?.role||"member"}</span><button className="btn secondary" onClick={signOut}>Sign out</button></>:<span className="muted">Secure marketplace workspace</span>}</div></header>
    <div className="wrap">
      {!session ? <div className="card" style={{maxWidth:520,margin:"5vh auto"}}><div className="eyebrow">JOIN THE MARKETPLACE</div><h1>{authMode==="signup"?"Create your MarketBridge account":"Welcome back"}</h1><p className="muted">Businesses post projects. Developers and marketers submit proposals.</p>
        <form onSubmit={auth}>
          {authMode==="signup"&&<><div className="field"><label>Full name</label><input name="name" required/></div><div className="field"><label>Account type</label><select name="role"><option value="business">Business / project owner</option><option value="marketer">Developer / marketer / agency</option></select></div></>}
          <div className="field"><label>Email</label><input name="email" type="email" required/></div><div className="field"><label>Password</label><input name="password" type="password" minLength={8} required/></div>
          <button className="btn primary" disabled={busy}>{busy?"Please wait…":authMode==="signup"?"Create account":"Sign in"}</button>
        </form><p className="muted">{authMode==="signup"?"Already registered?":"New to MarketBridge?"} <button className="btn secondary" onClick={()=>setAuthMode(authMode==="signup"?"login":"signup")}>{authMode==="signup"?"Sign in":"Create account"}</button></p>{message&&<p className="success">{message}</p>}
      </div> : <>
        {page==="overview"&&<><div className="eyebrow">MARKETPLACE WORKSPACE</div><h1>Welcome to MarketBridge</h1><p className="muted">Find the right talent, publish projects and manage proposals.</p><div className="grid stats"><div className="card stat">Open projects<strong>{projects.length}</strong></div><div className="card stat">Your account<strong>{profile?.role||"Member"}</strong></div><div className="card stat">Verification<strong>{profile?.verification_status||"Pending"}</strong></div><div className="card stat">Marketplace<strong>Live database</strong></div></div><div className="grid cols"><div className="card"><h2>Latest open projects</h2>{projects.slice(0,5).map(p=><div className="project" key={p.id}><h3>{p.title}</h3><p className="muted">{p.company_name} · {p.category} · ₹{p.budget.toLocaleString("en-IN")}</p><p>{p.description}</p></div>)||<p className="muted">No projects yet. Post the first project.</p>}</div><div className="card"><h2>Next steps</h2><p>1. Complete your profile.</p><p>2. Submit verification request.</p><p>3. Post a project or apply to a suitable brief.</p><p className="notice">Payment and identity verification are not active until approved providers are connected.</p></div></div></>}
        {page==="projects"&&<><div className="eyebrow">OPPORTUNITIES</div><h1>Browse open projects</h1><div className="card">{projects.map(p=><div className="project" key={p.id}><div className="row"><h3>{p.title}</h3><span className="tag">{p.category}</span></div><p className="muted">{p.company_name} · {p.duration} · {p.work_mode} · ₹{p.budget.toLocaleString("en-IN")}</p><p>{p.description}</p>{profile?.role==="marketer"&&<form onSubmit={e=>submitProposal(e,p.id)} className="formgrid"><div className="field"><label>Your quote (₹)</label><input name="price" type="number" min="1" required/></div><div className="field"><label>Delivery days</label><input name="days" type="number" min="1" required/></div><div className="field full"><label>Proposal</label><textarea name="message" required minLength={20}/></div><div className="field full"><button className="btn primary" disabled={busy}>Submit proposal</button></div></form>}</div>)}</div></>}
        {page==="post-project"&&<><div className="eyebrow">BUSINESS WORKSPACE</div><h1>Post a project</h1><div className="card"><form onSubmit={postProject} className="formgrid"><div className="field"><label>Project title</label><input name="title" required/></div><div className="field"><label>Company name</label><input name="company" required/></div><div className="field"><label>Category</label><select name="category"><option>Website Development</option><option>App Development</option><option>Software Development</option><option>Social Media Marketing</option><option>SEO</option><option>UI/UX Design</option><option>AI & Automation</option><option>Lead Generation</option></select></div><div className="field"><label>Budget (₹)</label><input name="budget" type="number" min="1000" required/></div><div className="field"><label>Duration</label><select name="duration"><option>2 weeks</option><option>1 month</option><option>6 weeks</option><option>2 months</option><option>3 months</option></select></div><div className="field"><label>Work mode</label><select name="work_mode"><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div><div className="field full"><label>Project description and deliverables</label><textarea name="description" minLength={30} required/></div><div className="field full"><label>Required skills (comma-separated)</label><input name="skills"/></div><div className="field full"><button className="btn primary" disabled={busy}>Publish project</button></div></form></div></>}
        {page==="proposals"&&<div className="card"><h1>My proposals</h1><p className="muted">Proposal list view is the next implementation module. Proposal records are protected by database policies.</p></div>}
        {page==="verification"&&<div className="card"><h1>Identity verification</h1><p className="muted">Production KYC is performed through an approved provider. Do not upload identity documents into this starter app.</p><p className="notice">No Aadhaar, PAN, passport number, home address or bank details are collected in this demo interface.</p></div>}
        {page==="trust"&&<div className="card"><h1>Trust & safety</h1><p>Use written scopes, milestone approvals, verified profiles and documented dispute procedures.</p><p className="notice">Account suspension alone is not payment protection. Use an approved marketplace settlement provider before advertising held funds or escrow.</p></div>}
        {page==="payments"&&<div className="card"><h1>Payments</h1><p className="muted">Payment provider integration is intentionally disabled until merchant onboarding and marketplace settlement approval are complete.</p><p className="notice">Do not enter card, UPI PIN, bank credentials or payment secrets into this demo.</p></div>}
        {message&&<p className="success">{message}</p>}
      </>}
    </div></main>
  </div>;
}

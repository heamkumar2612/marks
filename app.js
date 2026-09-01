const DEMO = {
  users: {
    admin: {role:"admin", name:"Central Administrator", email:"admin@resqflow.demo", password:"admin123"},
    hospital: {role:"hospital", name:"City Emergency Hospital", email:"hospital@resqflow.demo", password:"hospital123"},
    ambulance: {role:"ambulance", name:"AMB-102 • EMS Driver", email:"ambulance@resqflow.demo", password:"ambulance123"}
  },
  hospitals: [
    {id:"H-A",name:"District Hospital A",type:"District",trauma:true,ct:true,specialist:false,load:92,status:"HIGH",verification:""},
    {id:"H-B",name:"City Emergency Hospital",type:"Emergency",trauma:true,ct:true,specialist:true,load:46,status:"NORMAL",verification:"ACCEPTED"},
    {id:"H-C",name:"Community Hospital C",type:"Community",trauma:false,ct:true,specialist:false,load:31,status:"NORMAL",verification:""},
    {id:"H-D",name:"Medical College D",type:"Tertiary",trauma:true,ct:true,specialist:true,load:62,status:"NORMAL",verification:""}
  ],
  ambulances:[
    {id:"AMB-101",driver:"Karthik",status:"AVAILABLE",caseId:null,eta:null},
    {id:"AMB-102",driver:"Arun",status:"IN TRANSIT",caseId:"RQ-2048",eta:18},
    {id:"AMB-103",driver:"Meena",status:"AVAILABLE",caseId:null,eta:null}
  ],
  cases:[
    {id:"RQ-2048",type:"Road Accident",urgency:"CRITICAL",location:"NH-44 Junction, Chennai",required:"Trauma",currentFacility:"PHC X",destination:"City Emergency Hospital",destinationId:"H-B",ambulance:"AMB-102",eta:18,status:"IN_TRANSIT",condition:"Critical",created:"10:02",updated:"10:57",
      passport:{observed:"Severe bleeding; suspected fracture",care:"Bleeding controlled; IV started",notes:"Higher-level trauma evaluation required"},
      timeline:[
        ["10:02","Emergency reported"],["10:04","Ambulance AMB-102 assigned"],["10:08","Patient picked up"],["10:13","Trauma capability identified"],["10:15","Hospital A requested"],["10:16","Hospital A declined"],["10:16","Hospital B accepted"],["10:17","Route confirmed"],["10:57","Condition changed to CRITICAL"]]},
    {id:"RQ-2051",type:"Acute respiratory distress",urgency:"MODERATE",location:"Tambaram",required:"Emergency",currentFacility:"PHC Y",destination:"",destinationId:"",ambulance:"",eta:null,status:"VERIFICATION_PENDING",condition:"Moderate",created:"11:10",updated:"11:17",
      passport:{observed:"Breathing difficulty",care:"Oxygen initiated",notes:"Needs higher-level emergency assessment"},
      timeline:[["11:10","Case created"],["11:12","Emergency capability identified"],["11:15","Referral created"],["11:17","Awaiting receiving-facility confirmation"]]},
    {id:"RQ-2058",type:"Minor injury",urgency:"LOW",location:"Guindy",required:"Primary Care",currentFacility:"Local Clinic",destination:"Local Clinic",destinationId:"",ambulance:"",eta:null,status:"CLOSED",condition:"Stable",created:"09:40",updated:"10:05",
      passport:{observed:"Minor laceration",care:"Wound cleaned",notes:"No transfer required"},
      timeline:[["09:40","Emergency reported"],["09:48","Low urgency confirmed"],["10:05","Local treatment completed"]]}
  ]
};

let state = {
  role: null,
  user: null,
  page: "dashboard",
  toastTimer: null
};

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
function getData(){ 
  const raw = localStorage.getItem("resqflow-data"); 
  if(raw) return JSON.parse(raw);
  const d=clone(DEMO); localStorage.setItem("resqflow-data",JSON.stringify(d)); return d;
}
function setData(d){localStorage.setItem("resqflow-data",JSON.stringify(d))}
function resetDemo(){ localStorage.removeItem("resqflow-data"); location.reload(); }
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function badge(value){
  const v=String(value).toUpperCase();
  const c=v.includes("CRITICAL")||v==="DECLINED"||v==="HIGH"?"red":v.includes("MODERATE")||v.includes("PENDING")||v.includes("LIMIT")||v==="WARNING"?"yellow":v.includes("ACCEPT")||v==="NORMAL"||v==="STABLE"||v==="AVAILABLE"||v==="CLOSED"?"green":v.includes("IN TRANSIT")||v==="ASSIGNED"?"blue":"gray";
  return `<span class="badge ${c}">${escapeHtml(value)}</span>`;
}
function toast(msg){
  clearTimeout(state.toastTimer); const el=document.createElement("div");el.className="toast";el.textContent=msg;document.body.appendChild(el);
  state.toastTimer=setTimeout(()=>el.remove(),2600);
}
function kpi(label,value,sub=""){return `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="small muted">${sub}</div></div>`}
function nowTime(){return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}).replace(" ","")}
function addEvent(c,event){
  c.timeline.push([nowTime(),event]); c.updated=nowTime();
}
function computeStats(d){
  return {
    active:d.cases.filter(c=>!["CLOSED","FOLLOW_UP"].includes(c.status)).length,
    critical:d.cases.filter(c=>c.urgency==="CRITICAL" && c.status!=="CLOSED").length,
    activeAmb:d.ambulances.filter(a=>a.status!=="AVAILABLE").length,
    pending:d.cases.filter(c=>c.status==="VERIFICATION_PENDING").length,
    highLoad:d.hospitals.filter(h=>h.load>=85).length,
    confirmed:d.cases.filter(c=>c.destination && ["ACCEPTED","IN_TRANSIT","ARRIVED","HANDOVER"].some(x=>c.status.includes(x))).length
  };
}
function renderLogin(){
  document.getElementById("app").innerHTML=`
  <div class="login">
    <div class="login-box">
      <div class="login-left">
        <h1>ResQFlow</h1>
        <p>Dynamic Emergency Care Coordination Network</p>
        <div class="login-feature">
          <div>🧠 CareBridge — identify next care requirement</div>
          <div>✅ ResQVerify — confirm receiving facility readiness</div>
          <div>🚑 ResQRoute — coordinate ambulance + ETA</div>
          <div>🔄 ResQContinuum — preserve the case journey</div>
        </div>
      </div>
      <div class="login-right">
        <h2>Sign in</h2>
        <div class="muted small">Demo prototype — use one of the roles below.</div>
        <div class="role-grid">
          <button class="role-btn active" data-role="admin">Admin</button>
          <button class="role-btn" data-role="hospital">Hospital</button>
          <button class="role-btn" data-role="ambulance">Ambulance</button>
        </div>
        <form id="loginForm">
          <div class="field"><label>Email</label><input id="email" type="email" required></div>
          <div class="field"><label>Password</label><input id="password" type="password" required></div>
          <button class="btn primary" style="width:100%">Login to ResQFlow</button>
        </form>
        <div class="small muted" style="margin-top:14px">Admin: admin@resqflow.demo / admin123<br>Hospital: hospital@resqflow.demo / hospital123<br>Ambulance: ambulance@resqflow.demo / ambulance123</div>
      </div>
    </div>
  </div>`;
  let selected="admin";
  document.querySelectorAll(".role-btn").forEach(btn=>btn.onclick=()=>{
    selected=btn.dataset.role;document.querySelectorAll(".role-btn").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    document.getElementById("email").value=DEMO.users[selected].email;document.getElementById("password").value=DEMO.users[selected].password;
  });
  document.getElementById("email").value=DEMO.users.admin.email;
  document.getElementById("password").value=DEMO.users.admin.password;
  document.getElementById("loginForm").onsubmit=e=>{
    e.preventDefault(); const u=DEMO.users[selected];
    if(document.getElementById("email").value===u.email && document.getElementById("password").value===u.password){state.role=u.role;state.user=u;state.page="dashboard";renderApp();}
    else toast("Invalid demo credentials");
  };
}
function nav(){
  const common=[["dashboard","Dashboard","◼"],["cases","Emergency Cases","🚨"],["hospitals","Hospitals","🏥"]];
  const extra=state.role==="admin"?[["network","Network & Load","◉"],["audit","Audit Log","☷"]]:state.role==="hospital"?[["incoming","Incoming Requests","!"],["referrals","Referrals","↗"]]:[["mycase","My Assignment","🚑"]];
  return [...common,...extra];
}
function renderShell(){
  return `<div class="app-shell"><aside class="sidebar">
    <div class="brand">ResQFlow<small>Emergency Care Coordination</small></div>
    <div>${nav().map(([id,label,icon])=>`<button class="nav-btn ${state.page===id?"active":""}" data-page="${id}">${icon}&nbsp; ${label}</button>`).join("")}</div>
    <div class="sidebar-footer"><button class="nav-btn" id="resetBtn">↻ Reset demo</button><button class="nav-btn" id="logoutBtn">⇦ Logout</button></div>
  </aside><main class="main" id="main"></main></div>`;
}
function renderApp(){
  document.getElementById("app").innerHTML=renderShell();
  document.querySelectorAll(".nav-btn[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;renderApp()});
  document.getElementById("logoutBtn").onclick=()=>{state.role=null;state.user=null;renderLogin()};
  document.getElementById("resetBtn").onclick=resetDemo;
  const titles={dashboard:"Operations Dashboard",cases:"Emergency Cases",hospitals:"Hospital Network",network:"Network & Load",audit:"Audit Log",incoming:"Incoming Requests",referrals:"Referral Management",mycase:"My Assignment"};
  document.getElementById("main").innerHTML=`<div class="topbar"><div class="title"><h1>${titles[state.page]||"ResQFlow"}</h1><p>Live coordination for emergency care transitions.</p></div><div class="user-pill">${escapeHtml(state.user.name)} • ${state.role.toUpperCase()}</div></div>${renderPage()}`;
  wirePage();
}
function renderPage(){
  const d=getData();
  if(state.page==="dashboard") return renderDashboard(d);
  if(state.page==="cases") return renderCases(d);
  if(state.page==="hospitals") return renderHospitals(d);
  if(state.page==="network") return renderNetwork(d);
  if(state.page==="audit") return renderAudit(d);
  if(state.page==="incoming") return renderIncoming(d);
  if(state.page==="referrals") return renderReferrals(d);
  if(state.page==="mycase") return renderMyCase(d);
  return renderDashboard(d);
}
function renderDashboard(d){
  const s=computeStats(d);
  return `<div class="grid kpi-grid">${kpi("Active Emergencies",s.active,"Current open cases")}${kpi("Critical Cases",s.critical,"Needs close monitoring")}${kpi("Active Ambulances",s.activeAmb,"Currently assigned / moving")}${kpi("Pending Verifications",s.pending,"Awaiting hospital response")}</div>
  <div class="grid two">
    <div class="card"><div class="card-head"><h3>Live Emergency Map</h3>${badge("LIVE")}</div><div class="map"><div class="road r1"></div><div class="road r2"></div><div class="road r3"></div><div class="marker inc" title="Incident"></div><div class="marker amb" title="Ambulance"></div><div class="marker hosp" title="Confirmed hospital"></div></div><div class="legend"><span><i class="dot" style="background:#f6a700"></i>Incident</span><span><i class="dot" style="background:#0f62fe"></i>Ambulance</span><span><i class="dot" style="background:#e5484d"></i>Hospital</span></div></div>
    <div class="card"><div class="card-head"><h3>Priority Alerts</h3></div>${d.cases.filter(c=>c.urgency==="CRITICAL"||c.status==="VERIFICATION_PENDING").slice(0,4).map(c=>`<div class="alert ${c.urgency==="CRITICAL"?"red":"blue"}"><strong>${c.id}</strong> — ${escapeHtml(c.type)}<br><span class="small">${escapeHtml(c.status.replaceAll("_"," "))} • Updated ${c.updated}</span></div>`).join("") || '<div class="empty">No priority alerts</div>'}</div>
  </div>
  <div class="grid two" style="margin-top:16px">
   <div class="card"><div class="card-head"><h3>Active Cases</h3><button class="btn" data-go="cases">View all</button></div>${caseTable(d.cases.filter(c=>c.status!=="CLOSED").slice(0,6))}</div>
   <div class="card"><div class="card-head"><h3>Hospital Load</h3></div>${d.hospitals.map(h=>`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><strong>${escapeHtml(h.name)}</strong><span>${h.load}% ${badge(h.status)}</span></div><div class="progress"><span style="width:${h.load}%"></span></div></div>`).join("")}</div>
  </div>`;
}
function caseTable(cases){
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Case</th><th>Urgency</th><th>Required</th><th>Destination</th><th>Status</th></tr></thead><tbody>${cases.map(c=>`<tr><td><strong>${c.id}</strong><div class="small muted">${escapeHtml(c.type)}</div></td><td>${badge(c.urgency)}</td><td>${escapeHtml(c.required)}</td><td>${escapeHtml(c.destination||"—")}</td><td>${badge(c.status.replaceAll("_"," "))}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderCases(d){
 return `<div class="card"><div class="card-head"><h3>Emergency Case Registry</h3><button class="btn primary" id="newCaseBtn">+ New Emergency</button></div>${caseTable(d.cases)}</div>
 <div class="card" style="margin-top:16px"><div class="card-head"><h3>Selected Case Detail</h3><select id="caseSelect">${d.cases.map(c=>`<option value="${c.id}">${c.id} — ${escapeHtml(c.type)}</option>`).join("")}</select></div><div id="caseDetail">${caseDetail(d,d.cases[0]?.id)}</div></div>`;
}
function caseDetail(d,id){
 const c=d.cases.find(x=>x.id===id); if(!c)return "";
 const h=d.hospitals.find(x=>x.id===c.destinationId);
 return `<div class="grid two">
   <div><div class="grid three">${kpi("Urgency",badge(c.urgency),"Current assessment")}${kpi("Status",badge(c.status.replaceAll("_"," ")),"Case state")}${kpi("ETA",c.eta?c.eta+" min":"—","Current estimate")}</div>
   <div class="card" style="margin-top:12px;border:0;background:#f8fafc"><div class="card-head"><h3>Emergency Passport</h3></div><p><strong>Incident:</strong> ${escapeHtml(c.type)}</p><p><strong>Location:</strong> ${escapeHtml(c.location)}</p><p><strong>Required:</strong> ${escapeHtml(c.required)}</p><p><strong>Observed:</strong> ${escapeHtml(c.passport.observed)}</p><p><strong>Care provided:</strong> ${escapeHtml(c.passport.care)}</p><p><strong>Destination:</strong> ${escapeHtml(c.destination||"Awaiting confirmation")}</p></div>
   <div class="actions"><button class="btn warn" data-action="condition" data-id="${c.id}">Update Condition</button><button class="btn primary" data-action="reeval" data-id="${c.id}">Request Re-evaluation</button></div></div>
   <div class="card"><div class="card-head"><h3>Case Timeline</h3></div><div class="timeline">${c.timeline.slice().reverse().map(e=>`<div class="event"><div class="event-line"></div><div class="event-body"><div class="event-title">${escapeHtml(e[1])}</div><div class="event-time">${escapeHtml(e[0])}</div></div></div>`).join("")}</div></div>
 </div>`;
}
function renderHospitals(d){
 return `<div class="card"><div class="card-head"><h3>Participating Facilities</h3><span class="small muted">${d.hospitals.length} facilities online</span></div>
 <div class="table-wrap"><table class="table"><thead><tr><th>Hospital</th><th>Type</th><th>Trauma</th><th>CT</th><th>Specialist</th><th>Load</th><th>Readiness</th></tr></thead><tbody>${d.hospitals.map(h=>`<tr><td><strong>${escapeHtml(h.name)}</strong><div class="small muted">${h.id}</div></td><td>${escapeHtml(h.type)}</td><td>${h.trauma?"✓":"—"}</td><td>${h.ct?"✓":"—"}</td><td>${h.specialist?"✓":"—"}</td><td>${h.load}%</td><td>${badge(h.status)}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function renderNetwork(d){
 return `<div class="grid two">
 <div class="card"><div class="card-head"><h3>Emergency Network Load</h3></div>${d.hospitals.map(h=>`<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between"><strong>${escapeHtml(h.name)}</strong>${badge(h.status)}</div><div class="small muted" style="margin:4px 0 7px">${h.load}% current emergency load</div><div class="progress"><span style="width:${h.load}%"></span></div></div>`).join("")}</div>
 <div class="card"><div class="card-head"><h3>Predictive Congestion</h3>${badge("AI SUPPORT")}</div><div class="alert red"><strong>Hospital A</strong><br>Current load 92% • high congestion risk.</div><div class="alert"><strong>Hospital C</strong><br>Projected demand may rise if new moderate cases arrive.</div><div class="alert blue"><strong>Network note</strong><br>Eligibility and confirmed acceptance remain higher priority than load balancing.</div></div></div>`;
}
function renderAudit(d){
 const rows=[]; d.cases.forEach(c=>c.timeline.forEach(e=>rows.push({time:e[0],case:c.id,event:e[1]})));
 rows.sort((a,b)=>a.case.localeCompare(b.case));
 return `<div class="card"><div class="card-head"><h3>Audit & Activity</h3><span class="small muted">Case-level event trail</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Time</th><th>Case</th><th>Event</th><th>Actor</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r.time)}</td><td>${escapeHtml(r.case)}</td><td>${escapeHtml(r.event)}</td><td>${escapeHtml(state.role==="admin"?"ResQFlow System":"Authorized User")}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function renderIncoming(d){
 const pending=d.cases.filter(c=>c.status==="VERIFICATION_PENDING");
 return `<div class="card"><div class="card-head"><h3>Incoming Emergency Requests</h3>${badge("FACILITY VIEW")}</div>${pending.length?pending.map(c=>`
 <div class="card" style="margin:12px 0;border:1px solid #dbe4f0;box-shadow:none"><div class="card-head"><div><h3>${c.id} • ${escapeHtml(c.type)}</h3><div class="small muted">${escapeHtml(c.location)} • Required: ${escapeHtml(c.required)}</div></div>${badge(c.urgency)}</div>
 <p class="small"><strong>Observed:</strong> ${escapeHtml(c.passport.observed)}</p><p class="small"><strong>Care provided:</strong> ${escapeHtml(c.passport.care)}</p>
 <div class="actions"><button class="btn success" data-hospital="accept" data-id="${c.id}">ACCEPT</button><button class="btn warn" data-hospital="limit" data-id="${c.id}">ACCEPT WITH LIMITATION</button><button class="btn danger" data-hospital="decline" data-id="${c.id}">DECLINE</button></div></div>`).join(""):'<div class="empty">No pending emergency requests.</div>'}</div>`;
}
function renderReferrals(d){
 return `<div class="card"><div class="card-head"><h3>Referral / Transfer Continuity</h3></div>${d.cases.map(c=>`<div class="card" style="margin:10px 0;border:1px solid #e4eaf2;box-shadow:none"><strong>${c.id}</strong> — ${escapeHtml(c.type)}<div class="small muted" style="margin:4px 0 8px">${escapeHtml(c.currentFacility||"—")} → ${escapeHtml(c.destination||"Next facility pending")}</div><div class="actions"><button class="btn" data-referral="${c.id}">Create Higher-Level Referral</button></div></div>`).join("")}</div>`;
}
function renderMyCase(d){
 const c=d.cases.find(x=>x.id==="RQ-2048")||d.cases[0];
 return `<div class="grid two">
 <div class="card"><div class="card-head"><h3>Current Assignment</h3>${badge(c.status.replaceAll("_"," "))}</div>
  <div class="grid three">${kpi("Case",c.id,"Emergency case")}${kpi("Urgency",badge(c.urgency),"Current")}${kpi("ETA",c.eta?c.eta+" min":"—","Current estimate")}</div>
  <p><strong>Pickup:</strong> ${escapeHtml(c.location)}</p><p><strong>Destination:</strong> ${escapeHtml(c.destination||"Awaiting confirmation")}</p><p><strong>Hospital:</strong> ${c.destination?badge("ACCEPTED"):"—"}</p>
  <div class="map"><div class="road r1"></div><div class="road r2"></div><div class="road r3"></div><div class="marker inc"></div><div class="marker amb"></div><div class="marker hosp"></div></div>
  <div class="actions" style="margin-top:12px"><button class="btn primary" data-action="drive">Simulate Route Update</button><button class="btn warn" data-action="condition" data-id="${c.id}">Update Condition</button><button class="btn danger" data-action="reeval" data-id="${c.id}">Request Re-evaluation</button></div>
 </div>
 <div class="card"><div class="card-head"><h3>Emergency Handover</h3></div><div class="alert blue">Share the minimum necessary emergency information with the receiving team.</div><p><strong>Incident:</strong> ${escapeHtml(c.type)}</p><p><strong>Condition:</strong> ${escapeHtml(c.condition)}</p><p><strong>Observed:</strong> ${escapeHtml(c.passport.observed)}</p><p><strong>Care already provided:</strong> ${escapeHtml(c.passport.care)}</p><button class="btn success" data-action="handover" data-id="${c.id}">Complete Handover</button></div>
 </div>`;
}
function wirePage(){
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{state.page=b.dataset.go;renderApp()});
  const sel=document.getElementById("caseSelect"); if(sel) sel.onchange=()=>document.getElementById("caseDetail").innerHTML=caseDetail(getData(),sel.value);
  document.getElementById("newCaseBtn")?.addEventListener("click",()=>newCase());
  document.querySelectorAll("[data-hospital]").forEach(b=>b.onclick=()=>hospitalResponse(b.dataset.id,b.dataset.hospital));
  document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>handleAction(b.dataset.action,b.dataset.id));
  document.querySelectorAll("[data-referral]").forEach(b=>b.onclick=()=>createReferral(b.dataset.referral));
}
function newCase(){
 const d=getData(); const id="RQ-"+(2060+d.cases.length);
 const c={id,type:"Chest pain / acute event",urgency:"MODERATE",location:"Device / manually entered location",required:"Emergency",currentFacility:"Community Clinic",destination:"",destinationId:"",ambulance:"",eta:null,status:"VERIFICATION_PENDING",condition:"Moderate",created:nowTime(),updated:nowTime(),passport:{observed:"Initial emergency information awaiting full assessment",care:"First aid / initial stabilization",notes:"Receiving facility required"},timeline:[[nowTime(),"Emergency case created"],[nowTime(),"Awaiting facility verification"]]};
 d.cases.unshift(c);setData(d);toast(`${id} created — verification pending`);renderApp();
}
function hospitalResponse(id,action){
 const d=getData(); const c=d.cases.find(x=>x.id===id); if(!c)return;
 const h=d.hospitals.find(x=>x.id==="H-B")||d.hospitals[1];
 if(action==="accept"){c.destination=h.name;c.destinationId=h.id;c.status="ACCEPTED";c.eta=18;h.verification="ACCEPTED";addEvent(c,`${h.name} accepted the case`);toast("Case accepted — destination confirmed");}
 if(action==="limit"){c.destination=h.name;c.destinationId=h.id;c.status="ACCEPTED_WITH_LIMITATION";c.eta=18;addEvent(c,`${h.name} accepted with limitation: CT may require external transfer`);toast("Accepted with limitation");}
 if(action==="decline"){c.status="VERIFICATION_PENDING";addEvent(c,`${h.name} declined — seeking next eligible facility`);toast("Hospital declined; re-verification required");}
 setData(d);renderApp();
}
function handleAction(action,id){
 const d=getData(); const c=d.cases.find(x=>x.id===id)||d.cases[0]; if(!c)return;
 if(action==="condition"){c.urgency=c.urgency==="MODERATE"?"CRITICAL":c.urgency==="CRITICAL"?"STABLE":"MODERATE";c.condition=c.urgency==="STABLE"?"Stable":c.urgency.charAt(0)+c.urgency.slice(1).toLowerCase();c.status="RE_EVALUATION";addEvent(c,`Patient condition updated to ${c.urgency}; re-evaluation triggered`);toast("Patient condition updated — re-evaluation triggered");}
 if(action==="reeval"){c.status="RE_EVALUATION";addEvent(c,"ResQFlow re-evaluation requested");toast("Case sent for re-evaluation");}
 if(action==="drive"){c.eta=Math.max(7,(c.eta||18)-3);addEvent(c,`Route updated; dynamic ETA now ${c.eta} min`);toast(`Route updated — ETA ${c.eta} min`);}
 if(action==="handover"){c.status="HANDOVER";addEvent(c,"Digital emergency handover completed at receiving facility");toast("Digital handover completed");}
 setData(d);renderApp();
}
function createReferral(id){
 const d=getData(); const c=d.cases.find(x=>x.id===id);if(!c)return;
 c.status="REFERRED";addEvent(c,"Higher-level referral created");toast(`${id} referral created`);setData(d);renderApp();
}

const originalGetStats = computeStats;
window.addEventListener("beforeunload",()=>{});
renderLogin();


const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem('echoo.'+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('echoo.'+k,JSON.stringify(v))}catch(e){}}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const nowT=()=>new Date().toTimeString().slice(0,8);
const I={
 chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
 task:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 3 3 5-6"/>',
 auto:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="3"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
 ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 up:'<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z"/>',
 down:'<path d="M17 14V2"/><path d="M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.8 1.1L12 22a3.1 3.1 0 0 1-3-3.9z"/>',
 spk:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 retry:'<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4.5H8"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
 folder:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2.5h6.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
 bulb:'<path d="M4.5 17.5a8.5 8.5 0 1 1 15 0"/><path d="m12 15 4-5"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/>'
};
const svg=(k,cls='')=>`<svg viewBox="0 0 24 24" ${cls}>${I[k]||k}</svg>`;
const LOADER='<div class="hlines"><i></i><i></i><i></i></div>';

/* ---------- state ---------- */
let P=Object.assign({full:'razpreet wander',nick:'razpreet',theme:'system',font:'default',voice:'',email:'',age:'',notif:false,avatar:'',phone:false,root:false,acc:false,files:{Downloads:true,Documents:false,Pictures:false}},LS.get('p',{}));
const saveP=()=>LS.set('p',P);
let ghost=false,deep=false,uploads=[],chats=LS.get('chats',[]),tasks=LS.get('tasks',[]),autos=LS.get('autos',[]),projects=LS.get('projects',[]),
    filterVal='all',cur=null,gen=null,pages=[],timers={},recog=null,live={on:false,muted:false,speaker:true,busy:false,sr:null},openTaskId=null,taskTab='results',openProjId=null,prTab='pchat';
const save={chats:()=>LS.set('chats',chats),tasks:()=>LS.set('tasks',tasks),autos:()=>LS.set('autos',autos),projects:()=>LS.set('projects',projects),term:()=>LS.set('termSess',sessions)};
const userName=()=>(P.nick||P.full||'there').trim();
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2300)}
function applyLook(){const d=P.theme==='dark'||(P.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}
function paintProfile(){document.querySelectorAll('.avatar').forEach(a=>{a.style.backgroundImage=P.avatar?`url(${P.avatar})`:'';a.textContent=P.avatar?'':(P.full.trim()[0]||'?').toUpperCase()});$('sbName').textContent=P.full}
matchMedia('(prefers-color-scheme: dark)').onchange=applyLook;

/* ---------- menus ---------- */
document.addEventListener('click',e=>{
  if(!e.target.closest('#convMenu,#newConv'))$('convMenu').classList.remove('show');
  if(!e.target.closest('#filterMenu,#filterBtn'))$('filterMenu').classList.remove('show');
  if(!e.target.closest('#modelWrap'))closeModel();
  if(!e.target.closest('#popmenu,#attachBtn'))$('popmenu').classList.remove('show');
});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#msgMenu'))hideMsgMenu()});
function closeModel(){$('modelMenu').classList.remove('show');$('modelWrap').classList.remove('open')}

/* ---------- sidebar ---------- */
const sidebar=$('sidebar');
const setSide=o=>sidebar.classList.toggle('closed',!o);
$('sidebarOpen').onclick=()=>setSide(true);$('sidebarClose').onclick=()=>setSide(false);$('scrim').onclick=()=>setSide(false);
setSide(innerWidth>700);
$('newConv').onclick=e=>{e.stopPropagation();$('convMenu').classList.toggle('show')};
document.querySelectorAll('#convMenu .mi').forEach(b=>b.onclick=()=>{
  $('convMenu').classList.remove('show');closeAllPagesTo(0);const k=b.dataset.c;
  if(k==='chat')newChat();else if(k==='task')openTasks(true);else openAutos();
  if(innerWidth<=700)setSide(false);
});
$('filterBtn').onclick=e=>{e.stopPropagation();$('filterMenu').classList.toggle('show');syncFilter()};
function syncFilter(){document.querySelectorAll('#filterMenu .mi').forEach(m=>m.classList.toggle('sel',m.dataset.f===filterVal))}
document.querySelectorAll('#filterMenu .mi').forEach(m=>m.onclick=e=>{
  e.stopPropagation();filterVal=m.dataset.f;syncFilter();$('filterMenu').classList.remove('show');
  $('chatlist').innerHTML=LOADER;clearTimeout(renderHistory.t);renderHistory.t=setTimeout(renderHistory,650);
});
$('allToggle').onclick=()=>{const b=$('allToggle'),open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',open);$('chatlist').classList.toggle('hidden',!open)};
function allItems(){return [
  ...chats.map(c=>({type:'chat',id:c.id,title:c.title,ts:c.ts,pin:!!c.pin})),
  ...tasks.filter(t=>t.status!=='plan').map(t=>({type:'task',id:t.id,title:t.title,ts:t.createdAt,pin:!!t.pin})),
  ...autos.map(a=>({type:'automation',id:a.id,title:a.name,ts:a.createdAt,pin:!!a.pin}))].sort((a,b)=>(b.pin-a.pin)||b.ts-a.ts)}
const entOf=(type,id)=>type==='chat'?chats.find(x=>x.id===id):type==='task'?tasks.find(x=>x.id===id):autos.find(x=>x.id===id);
const saveOf=type=>type==='chat'?save.chats():type==='task'?save.tasks():save.autos();
function togglePin(type,id){const e=entOf(type,id);if(!e)return;e.pin=!e.pin;saveOf(type);renderHistory();setTitleUI();const cl=$('chatlist');cl.scrollTop=0;if(cl.parentElement)cl.parentElement.scrollTop=0;toast(e.pin?(type==='chat'?'Chat':type==='task'?'Task':'Automation')+' pinned':'Unpinned')}
function renameItem(type,id){const e=entOf(type,id);if(!e)return;const key=type==='automation'?'name':'title';
  openSheet(`<h4>Rename</h4><input class="fld" id="rnIn" maxlength="60" value="${esc(e[key])}"><div class="sbtns"><button id="rnNo">Cancel</button><button id="rnYes" style="background:#111;color:#fff">Save</button></div>`,s=>{
    const inp=s.querySelector('#rnIn');setTimeout(()=>{inp.focus();inp.select()},350);
    const go=()=>{const n=inp.value.trim();if(!n)return toast('Enter a name');e[key]=n;saveOf(type);closeSheet();renderHistory();setTitleUI();toast('Renamed')};
    s.querySelector('#rnNo').onclick=closeSheet;s.querySelector('#rnYes').onclick=go;inp.onkeydown=ev=>{if(ev.key==='Enter')go()}})}
const DEL_LABEL={chat:'chat',task:'task',automation:'automation'};
function confirmDelete(type,id){const e=entOf(type,id);if(!e)return;const L=DEL_LABEL[type];
  openSheet(`<h4>Delete this ${L}?</h4><p>"${esc(e.title||e.name)}" will be removed${type==='automation'?' along with its reports':type==='task'?' along with its logs':' with all its messages'}. This cannot be undone.</p><div class="sbtns"><button id="dlNo">Cancel</button><button class="dang" id="dlYes">Delete</button></div>`,s=>{
    s.querySelector('#dlNo').onclick=closeSheet;
    s.querySelector('#dlYes').onclick=()=>{
      if(type==='chat'){chats=chats.filter(c=>c.id!==id);save.chats();if(cur&&cur.id===id)newChat()}
      else if(type==='task'){clearTimeout(timers[id]);tasks=tasks.filter(t=>t.id!==id);save.tasks();if(openTaskId===id&&$('pgTask').classList.contains('open'))closePage()}
      else{autos=autos.filter(a=>a.id!==id);save.autos()}
      closeSheet();renderHistory();try{refreshAll()}catch(_){};toast(L[0].toUpperCase()+L.slice(1)+' deleted')}})}
function itemMenu(type,id){const e=entOf(type,id);if(!e)return;
  openSheet(`<h4>${esc(e.title||e.name)}</h4><button class="row" data-k="pin">${svg(PINI)}${e.pin?'Unpin':'Pin'}</button><button class="row" data-k="ren">${svg('edit')}Rename</button><button class="row" data-k="del" style="color:#c62828">${svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>')}Delete</button>`,s=>{
    s.querySelectorAll('.row').forEach(b=>b.onclick=()=>{const k=b.dataset.k;closeSheet();
      if(k==='pin')togglePin(type,id);else if(k==='ren')setTimeout(()=>renameItem(type,id),300);else setTimeout(()=>confirmDelete(type,id),300)})})}
const PINI='<path d="M9 4h6l-1 6 3 3v2H7v-2l3-3zM12 15v6"/>';
function setTitleUI(){const b=$('chatTitle');if(!b)return;const show=cur&&!ghost&&$('messages').style.display!=='none';b.style.display=show?'flex':'none';
  if(show)b.innerHTML=`${cur.pin?`<span class="pinned">${svg(PINI)}</span>`:''}<span class="ct">${esc(cur.title)}</span>`}
const TYPE_LABEL={chat:'Chat',task:'Task',automation:'Automation'};
function renderHistory(){
  const items=allItems().filter(i=>filterVal==='all'||i.type===filterVal).slice(0,50);
  $('chatlist').innerHTML=items.length?items.map(i=>`<div class="hi-item ${i.pin?'pinrow':''}" data-type="${i.type}" data-id="${i.id}">${svg(i.type==='chat'?'chat':i.type==='task'?'task':'auto')}<span>${esc(i.title)}</span><em class="tag">${TYPE_LABEL[i.type]}</em>${i.pin?`<button class="pinbtn on" title="Unpin">${svg(PINI)}</button>`:''}</div>`).join(''):`<div class="muted" style="padding:10px">Nothing here yet</div>`;
  document.querySelectorAll('#chatlist .hi-item').forEach(el=>{const ty=el.dataset.type,id=+el.dataset.id||el.dataset.id;let t=null,long=false;
    const key=(ty==='chat'||isNaN(+el.dataset.id))?el.dataset.id:el.dataset.id;
    el.onclick=e=>{if(long){long=false;return}if(e.target.closest('.pinbtn')){togglePin(ty,entId(ty,el.dataset.id));return}openItem(ty,entId(ty,el.dataset.id))};
    el.addEventListener('pointerdown',()=>{clearTimeout(t);t=setTimeout(()=>{long=true;itemMenu(ty,entId(ty,el.dataset.id))},520)});
    ['pointerup','pointerleave','pointercancel','pointermove'].forEach(ev=>el.addEventListener(ev,()=>clearTimeout(t)));
    el.addEventListener('contextmenu',e=>{e.preventDefault();itemMenu(ty,entId(ty,el.dataset.id))})});
  setTitleUI();
  const r=runningCount();$('agentSub').textContent=r?r+' running':'Idle';$('agentDot').style.display=r?'inline-block':'none';
}
const entId=(ty,s)=>{const a=ty==='chat'?chats:ty==='task'?tasks:autos;const m=a.find(x=>String(x.id)===String(s));return m?m.id:s};
function openItem(type,id){closeAllPagesTo(0);if(type==='chat')loadChat(id);else if(type==='task')openTask(id);else openAutos(id);if(innerWidth<=700)setSide(false)}

/* ---------- pages ---------- */
function openPage(el){
  el.classList.add('open');
  pages.push(el);
  if(el.id==='pgLive')startLiveTick();else stopLiveTick();
  try {
    history.pushState({echooPage: el.id, depth: pages.length}, '');
  } catch(e){}
}
function closePage(){const el=pages.pop();if(el)el.classList.remove('open');const top=pages[pages.length-1];if(top&&top.id==='pgLive')startLiveTick();else stopLiveTick()}
function closeAllPagesTo(n){while(pages.length>n)closePage()}
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>closePage());
$('chatTitle').onclick=()=>{if(cur)itemMenu('chat',cur.id)};
$('projects').onclick=()=>{closeAllPagesTo(0);renderProjects();openPage($('pgProjects'))};
$('agentFolder').onclick=()=>{closeAllPagesTo(0);renderAgent();openPage($('pgAgent'))};
const searchOpen=()=>{closeAllPagesTo(0);$('chatQ').value='';renderRes();openPage($('pgSearch'));setTimeout(()=>$('chatQ').focus(),380)};
$('searchChats').onclick=searchOpen;
$('chatQ').oninput=renderRes;
function renderRes(){const q=$('chatQ').value.toLowerCase();const r=allItems().filter(i=>i.title.toLowerCase().includes(q));
  $('chatRes').innerHTML=r.map(i=>`<div class="item" style="display:flex;justify-content:space-between;gap:10px" data-type="${i.type}" data-id="${i.id}"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.title)}</span><span class="muted">${TYPE_LABEL[i.type]}</span></div>`).join('')||`<div class="empty">${q?'No matching items':'Nothing here yet'}</div>`;
  $('chatRes').querySelectorAll('.item').forEach(el=>el.onclick=()=>{closeAllPagesTo(0);openItem(el.dataset.type,+el.dataset.id)})}
function openSheet(h,bind){$('sheet').innerHTML=h;$('sheet').classList.add('show');$('sheetBg').classList.add('show');bind&&bind($('sheet'))}
function closeSheet(){$('sheet').classList.remove('show');$('sheetBg').classList.remove('show')}
$('sheetBg').onclick=closeSheet;

/* ---------- chat ---------- */
function activateChat(){setTimeout(setTitleUI,0);$('welcome').style.display='none';$('ghostScreen').style.display='none';$('messages').style.display='flex'}
function showHome(){setTimeout(setTitleUI,0);$('welcome').style.display=ghost?'none':'flex';$('ghostScreen').style.display=ghost?'flex':'none';$('messages').style.display='none';$('messages').innerHTML=''}
function newChat(){if(gen)gen.stop();cur=null;uploads=[];deep=false;renderComposerTop();$('prompt').value='';autoGrow();showHome();closeAllPagesTo(0);toast('New chat started')}
$('ghostBtn').onclick=()=>{ghost=!ghost;$('ghostBtn').classList.toggle('on',ghost);cur=null;uploads=[];renderComposerTop();showHome();toast(ghost?'Incognito on: chat won\'t be saved':'Incognito off')};
function addMessage(role,text,files=[]){activateChat();const d=document.createElement('div');d.className='msg '+role;
  if(role==='assistant'){d.innerHTML='<div class="atext"></div>';d.firstChild.textContent=text}
  else{d.textContent=text;files.forEach(f=>{if(f.url){const im=document.createElement('img');im.src=f.url;im.alt=f.name;d.appendChild(im)}else{const s=document.createElement('div');s.style.marginTop='6px';s.textContent='📎 '+f.name;d.appendChild(s)}})}
  $('messages').appendChild(d);$('workspace').scrollTop=1e9;bindMsg(d);return d}
function setGen(on){$('sendBtn').classList.toggle('generating',on);$('sendBtn').title=on?'Stop':'Send'}
function demoReply(t){const s=t.toLowerCase();
  if(/^(hi|hello|hey)\b|hello/.test(s))return `Hello ${userName()}! 😊 I'm Echoo. How can I help you today?`;
  if(/my name|who am i/.test(s))return `Your name is ${P.full}, and I call you ${userName()}.`;
  if(/task|automat/.test(s))return `I can turn this into a task (planned, run and verified step by step) or an automation (repeats on a schedule). Use the icons below the reply.`;
  return `Got it. You asked: "${t}".\n\nThis is a working UI prototype. Connect a backend or AI API to get real, context-aware answers.`}
function respond(t,node){const m=node||addMessage('assistant','');const box=m.querySelector('.atext');const old=m.querySelector('.actions');old&&old.remove();
  box.innerHTML='<div class="hlines" style="width:200px;padding:6px 0"><i></i><i></i><i></i></div>';
  const words=demoReply(t).split(/(\s+)/);let i=0,out='';const g=gen={stop(){clearTimeout(g.t1);clearInterval(g.iv);finish(true)}};
  function finish(stopped){gen=null;setGen(false);box.textContent=out||(stopped?'⏹ Stopped':'');if(out){mountActions(m,out);if(!ghost&&cur){cur.msgs.push({r:'assistant',t:out});save.chats()}}}
  setGen(true);g.t1=setTimeout(()=>{box.textContent='';g.iv=setInterval(()=>{for(let k=0,n=2+Math.floor(Math.random()*3);k<n&&i<words.length;k++)out+=words[i++];box.textContent=out;$('workspace').scrollTop=1e9;if(i>=words.length){clearInterval(g.iv);finish(false)}},45)},700)}
function send(){if(gen)return;const text=$('prompt').value.trim();if(!text&&!uploads.length)return;const files=uploads.slice(),t=text||'Attached files';
  addMessage('user',t,files);
  if(!ghost){if(!cur){cur={id:Date.now(),type:'chat',title:t.slice(0,32),ts:Date.now(),msgs:[]};chats.unshift(cur)}cur.msgs.push({r:'user',t});save.chats();renderHistory()}
  $('prompt').value='';autoGrow();uploads=[];renderComposerTop();respond(text||'Please help with the attached files.')}
function autoGrow(){const p=$('prompt');p.style.height='auto';p.style.height=Math.min(p.scrollHeight,140)+'px';syncSend()}
function syncSend(){const t=!!($('prompt').value.trim()||uploads.length);$('sendBtn').classList.toggle('hastext',t);$('sendBtn').title=t?'Send':'Live conversation'}
$('prompt').addEventListener('input',autoGrow);   /* Enter = new line; only the send button sends */
$('sendBtn').onclick=()=>{if(gen){gen.stop();return}if($('prompt').value.trim()||uploads.length)send();else startLive()};
function loadChat(id){const c=chats.find(x=>x.id===id);if(!c)return;if(gen)gen.stop();cur=c;closeAllPagesTo(0);activateChat();$('messages').innerHTML='';
  c.msgs.forEach(m=>{const n=addMessage(m.r,m.t);if(m.r==='assistant')mountActions(n,m.t)});setTitleUI()}

/* ---------- long-press message menu: Copy / Edit / Retry ---------- */
let pressT=null;
function bindMsg(d){
  const stop=()=>clearTimeout(pressT);
  d.addEventListener('pointerdown',e=>{if(e.button)return;clearTimeout(pressT);const x=e.clientX,y=e.clientY;pressT=setTimeout(()=>showMsgMenu(d,x,y),420)});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>d.addEventListener(ev,stop));
  d.addEventListener('pointermove',e=>{if(Math.abs(e.movementX)+Math.abs(e.movementY)>6)stop()});
  d.addEventListener('contextmenu',e=>{e.preventDefault();showMsgMenu(d,e.clientX,e.clientY)});
}
function showMsgMenu(d,x,y){const role=d.classList.contains('user')?'user':'assistant';const menu=$('msgMenu');
  const items=role==='user'?[['copy','Copy'],['edit','Edit']]:[['copy','Copy']];
  menu.innerHTML=items.map(([k,l])=>`<button class="mi" data-k="${k}">${svg(k)}${l}</button>`).join('');
  menu.classList.add('show');const w=190,h=items.length*46+16;
  menu.style.left=Math.max(10,Math.min(innerWidth-w-10,x))+'px';menu.style.top=Math.max(10,Math.min(innerHeight-h-10,y>innerHeight/2?y-h-8:y+8))+'px';
  menu.querySelectorAll('.mi').forEach(b=>b.onclick=e=>{e.stopPropagation();hideMsgMenu();doMsgAction(b.dataset.k,d,role)})}
function hideMsgMenu(){$('msgMenu').classList.remove('show')}
function msgText(d){const a=d.querySelector('.atext');return a?a.textContent:d.childNodes[0].textContent}
function doMsgAction(k,d,role){const text=msgText(d);
  if(k==='copy'){copyText(text);toast('Copied')}
  else if(k==='edit'){$('prompt').value=text.trim();autoGrow();$('prompt').focus()}
  else if(k==='retry'){if(gen)return toast('Wait for the reply to finish');
    const all=[...$('messages').children];const userNode=role==='user'?d:all.slice(0,all.indexOf(d)).reverse().find(x=>x.classList.contains('user'));
    if(!userNode)return;const ui=all.indexOf(userNode),userText=msgText(userNode);
    all.slice(ui+1).forEach(x=>x.remove());
    if(cur){const k2=cur.msgs.findIndex(m=>m.r==='user'&&m.t===userText);if(k2>=0)cur.msgs=cur.msgs.slice(0,k2+1);save.chats()}
    respond(userText)}}
function copyText(t){return(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()})}

/* reply actions, in order: copy, like, dislike, speaker, make task (icon), automation (icon), share */
function mountActions(m,text){if(m.querySelector('.actions'))return;const a=document.createElement('div');a.className='actions';
  a.innerHTML=`<button data-k="copy" title="Copy">${svg('copy')}</button><button data-k="up" title="Like">${svg('up')}</button><button data-k="down" title="Dislike">${svg('down')}</button><button data-k="spk" title="Play">${svg(PLAY)}</button><button data-k="task" title="Make task">${svg('task')}</button><button data-k="auto" title="Automation">${svg('auto')}</button><button data-k="share" title="Share">${svg('share')}</button>`;
  m.appendChild(a);
  a.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');
    if(k==='copy')copyText(text).then(()=>{b.innerHTML=svg('ok');setTimeout(()=>b.innerHTML=svg('copy'),1400);toast('Copied')});
    else if(k==='up'||k==='down'){const o=a.querySelector('[data-k='+(k==='up'?'down':'up')+']');o.classList.remove('on');b.classList.toggle('on');if(b.classList.contains('on'))toast('Thanks for your feedback')}
    else if(k==='spk'){if(b.classList.contains('on')){b.classList.remove('on');b.innerHTML=svg(PLAY);speechSynthesis.cancel()}else{b.classList.add('on');b.innerHTML=svg(STOP);talk(text,()=>{b.classList.remove('on');b.innerHTML=svg(PLAY)})}}
    else if(k==='task'){const t=createTask(text,null,null);toast('Task created from this reply');closeAllPagesTo(0);openPage($('pgTasks'));openTask(t.id)}
    else if(k==='auto'){openAutoEdit(null,text);toast('Set the time and save to make an automation')}
    else if(k==='share'){if(navigator.share)navigator.share({text}).catch(()=>{});else moreSheet(text)}}}
function moreSheet(text){const enc=encodeURIComponent(text);const R=[['Send on WhatsApp',()=>open('https://wa.me/?text='+enc,'_blank')],['Send on Telegram',()=>open('https://t.me/share/url?url=%20&text='+enc,'_blank')],['Send by email',()=>location.href='mailto:?subject=Echoo&body='+enc],['Send by SMS',()=>location.href='sms:?body='+enc],['Save as text file',()=>{const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));l.download='echoo-reply.txt';l.click()}]];
  openSheet(R.map((r,i)=>`<button class="row" style="--i:${i}">${r[0]}</button>`).join(''),s=>s.querySelectorAll('.row').forEach((el,i)=>el.onclick=()=>{closeSheet();setTimeout(R[i][1],200)}))}
function talk(text,cb){if(!('speechSynthesis'in window)){cb&&cb();return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.onend=()=>cb&&cb();u.onerror=()=>cb&&cb();speechSynthesis.speak(u)}

/* ---------- composer chips: attachments + deep thinking inside the box ---------- */
function renderComposerTop(){const top=$('cTop');top.innerHTML='';
  if(deep)top.insertAdjacentHTML('beforeend',`<span class="chip">${svg('bulb')}Deep thinking<b data-x="deep">×</b></span>`);
  uploads.forEach((f,i)=>{const isImg=f.type&&f.type.startsWith('image/');
    top.insertAdjacentHTML('beforeend',isImg?`<div class="thumb"><img src="${f.url}" alt=""><b data-x="${i}">×</b></div>`:`<div class="thumb file">${svg('file','style="width:16px;height:16px;margin-right:6px"')}${esc(f.name)}<b data-x="${i}">×</b></div>`)});
  top.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{if(b.dataset.x==='deep'){deep=false;$('deepThink').classList.remove('sel')}else uploads.splice(+b.dataset.x,1);renderComposerTop();syncSend()});
  syncSend()}
function handleFiles(list){[...list].forEach(f=>{uploads.push({name:f.name,type:f.type,url:f.type&&f.type.startsWith('image/')?URL.createObjectURL(f):null})});renderComposerTop();$('popmenu').classList.remove('show');if(list.length)toast(list.length+' file(s) attached')}
['photoInput','cameraInput','audioInput','fileInput'].forEach(id=>$(id).addEventListener('change',e=>{handleFiles(e.target.files);e.target.value=''}));
$('attachBtn').onclick=e=>{e.stopPropagation();$('popmenu').classList.toggle('show')};
$('deepThink').onclick=()=>{deep=!deep;$('deepThink').classList.toggle('sel',deep);$('popmenu').classList.remove('show');renderComposerTop()};
$('modelBtn').onclick=e=>{e.stopPropagation();const open=!$('modelMenu').classList.contains('show');closeModel();if(open){$('modelMenu').classList.add('show');$('modelWrap').classList.add('open')}};
document.querySelectorAll('#modelMenu .mi').forEach(it=>it.onclick=e=>{e.stopPropagation();document.querySelectorAll('#modelMenu .mi').forEach(x=>x.classList.remove('sel'));it.classList.add('sel');$('modelName').innerHTML='<b>ECHOO</b> '+it.dataset.model;closeModel();toast('Model: ECHOO '+it.dataset.model)});
$('welcomeLive').onclick=startLive;

/* ---------- voice recording: live waveform that reacts to the mic ---------- */
let audioCtx=null,analyser=null,levelBuf=null,micStream=null,rec={on:false,bars:[],raf:0,last:0,base:'',cur:'',r:null};
async function ensureMic(){if(analyser)return true;try{micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')await audioCtx.resume();
  analyser=audioCtx.createAnalyser();analyser.fftSize=512;audioCtx.createMediaStreamSource(micStream).connect(analyser);levelBuf=new Uint8Array(analyser.fftSize);return true}catch(e){analyser=null;return false}}
function micLevel(){if(!analyser)return 0;analyser.getByteTimeDomainData(levelBuf);let s=0;for(let i=0;i<levelBuf.length;i++){const x=(levelBuf[i]-128)/128;s+=x*x}return Math.min(1,Math.sqrt(s/levelBuf.length)*5)}
function releaseMic(){if(micStream)micStream.getTracks().forEach(t=>t.stop());micStream=null;analyser=null}
function drawWave(ts){if(!rec.on)return;const wf=$('recWave'),dpr=devicePixelRatio||1,w=wf.clientWidth,h=wf.clientHeight;
  if(wf.width!==w*dpr||wf.height!==h*dpr){wf.width=w*dpr;wf.height=h*dpr}
  const c=wf.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const step=6,n=Math.max(8,Math.floor(w/step));
  if(ts-rec.last>55){rec.last=ts;const lv=analyser?micLevel():(0.12+Math.random()*0.5);rec.bars.push(lv);if(rec.bars.length>n)rec.bars.shift()}
  const dark=document.documentElement.dataset.theme==='dark';c.fillStyle=dark?'#d4d4d9':'#5f5f66';
  const off=n-rec.bars.length;
  for(let i=0;i<n;i++){const v=i<off?0:rec.bars[i-off];const bh=Math.max(4,Math.min(h,4+v*h*1.1)),x=i*step+1;c.beginPath();c.roundRect?c.roundRect(x,(h-bh)/2,3,bh,1.5):c.rect(x,(h-bh)/2,3,bh);c.fill()}
  rec.raf=requestAnimationFrame(drawWave)}
async function startRec(){if(rec.on)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('Speech input is not supported in this browser. Use Chrome.');return}
  rec.on=true;rec.bars=[];rec.base=$('prompt').value.trim();rec.cur='';document.body.classList.add('recording');$('popmenu').classList.remove('show');
  await ensureMic();
  const spawn=()=>{rec.r=new SR();rec.r.lang='en-IN';rec.r.interimResults=true;rec.r.continuous=true;
    rec.r.onresult=e=>{let fin='',cur='';for(let i=0;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript+' ';else cur+=e.results[i][0].transcript}rec.base=(rec.base+' '+fin).trim();rec.cur=cur};
    rec.r.onend=()=>{if(rec.on&&!rec.stopping){try{spawn()}catch(e){}}};
    try{rec.r.start()}catch(e){}};
  spawn();rec.raf=requestAnimationFrame(drawWave)}
function endRec(){rec.on=false;rec.stopping=true;cancelAnimationFrame(rec.raf);document.body.classList.remove('recording');try{rec.r&&rec.r.abort()}catch(e){}releaseMic();setTimeout(()=>rec.stopping=false,100)}
$('micBtn').onclick=startRec;
$('recCancel').onclick=()=>{endRec();$('prompt').value=rec.base.trim()===''?$('prompt').value:$('prompt').value};
$('recStop').onclick=()=>{const t=[rec.base,rec.cur].filter(Boolean).join(' ').trim();endRec();$('prompt').value=t;autoGrow();$('prompt').focus()};
$('recSend').onclick=()=>{const t=[rec.base,rec.cur].filter(Boolean).join(' ').trim();endRec();$('prompt').value=t;autoGrow();if(t||uploads.length)send()};

/* ---------- live conversation ---------- */
function startLive(){live.on=true;live.muted=false;$('liveScreen').classList.add('active');$('liveCaption').textContent='';$('liveStatus').textContent='Listening…';$('liveMute').classList.remove('off');listen()}
function listen(){if(!live.on||live.muted||live.busy)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$('liveStatus').textContent='Speech input is not supported here. Type below.';return}
  live.sr=new SR();live.sr.lang='en-IN';live.sr.interimResults=false;
  live.sr.onresult=e=>{const s=e.results[0][0].transcript;$('liveCaption').textContent='You: '+s;reply(s)};
  live.sr.onend=()=>{if(live.on&&!live.muted&&!live.busy)setTimeout(listen,250)};
  try{live.sr.start();$('liveStatus').textContent='Listening…'}catch(e){}}
function reply(s){live.busy=true;try{live.sr&&live.sr.abort()}catch(e){}const r=demoReply(s);$('liveCaption').textContent='Echoo: '+r;
  talk(r,()=>{live.busy=false;if(live.on){$('liveStatus').textContent='Your turn';listen()}})}
function stopLive(){live.on=false;try{live.sr&&live.sr.abort()}catch(e){}if('speechSynthesis'in window)speechSynthesis.cancel();$('liveScreen').classList.remove('active')}
$('liveEnd').onclick=stopLive;
$('liveMute').onclick=()=>{live.muted=!live.muted;$('liveMute').classList.toggle('off',live.muted);if(live.muted){try{live.sr&&live.sr.abort()}catch(e){}$('liveStatus').textContent='Mic is muted'}else listen()};
$('liveSpeak').onclick=()=>{live.speaker=!live.speaker;$('liveSpeak').classList.toggle('off',!live.speaker);if(!live.speaker&&'speechSynthesis'in window)speechSynthesis.cancel()};
$('liveInput').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target.value.trim();if(!t||live.busy)return;e.target.value='';live.busy=true;$('liveCaption').textContent='You: '+t;reply(t)});

/* ---------- task engine (simulated) ---------- */
const PERM={
  files:{t:'File access: Downloads folder',s:'Open Permissions → File manager and allow the Downloads folder. Then tap Grant here.'},
  phone:{t:'Phone control (accessibility)',s:'Open phone Settings → Accessibility → Echoo and turn it on. Then tap Grant here.'}
};
function planFromGoal(goal){
  const g=goal.toLowerCase();const s=[{t:'Find out how to do this (research the approach)',cmd:'cat request.json'}];
  if(/apk|app|android/.test(g))s.push({t:'Set up the Android project structure',cmd:'gradle init --type basic'},{t:'Write the app screens and logic',cmd:'python3 scaffold.py --app'},{t:'Build the APK',cmd:'./gradlew assembleDebug'});
  if(/download|youtube|video|yt/.test(g))s.push({t:'Download the video with yt-dlp',cmd:'yt-dlp -o "%(title)s.%(ext)s" <url>',perm:'files'});
  if(/pdf|excel|csv|file|photo|image|data/.test(g))s.push({t:'Process the files',cmd:'python3 process.py --input ./inputs'});
  if(/phone|screen|tap|open/.test(g))s.push({t:'Control the phone screen',cmd:'device.tap(x, y)',perm:'phone'});
  if(s.length===1)s.push({t:'Run the main action',cmd:'python3 run.py'});
  s.push({t:'Verify the result against the plan',cmd:'python3 verify.py'},{t:'Write the report',cmd:'python3 report.py'});
  return s.map((x,i)=>({...x,id:i,skip:false,state:'todo',retried:false}))}
function filesFor(goal){return /apk|app|android/i.test(goal)?['app/build.gradle','app/src/main/AndroidManifest.xml','app/src/main/java/MainActivity.kt','app/src/main/res/layout/activity_main.xml']:['output/report.md','scripts/run.py','scripts/verify.py']}
const task=id=>tasks.find(t=>t.id===id);
function runningCount(){return tasks.filter(t=>t.status==='running').length}
function appendTerm(t,line,cls){const col=cls==='ok'?32:cls==='err'?31:/^\$/.test(line)?33:37;termLogAdd(`${A(90,'['+nowT()+']')} ${A(36,'['+(t?t.title:'agent')+']')} ${A(col,line)}\n`,0);if($('pgTerminal').classList.contains('open')&&actSess===0)paintLog()}
function logT(t,line,cls){t.logs.push({ts:nowT(),line,cls:cls||''});appendTerm(t,line,cls)}
function createTask(goal,title,steps,fromAuto){
  const t={id:uid(),title:title||goal.slice(0,40),goal,status:'plan',steps:steps||planFromGoal(goal),idx:0,logs:[],errors:[],perms:[],summary:'',createdAt:Date.now(),fromAuto:fromAuto||null,chat:[],files:filesFor(goal),editedFiles:[]};
  tasks.unshift(t);save.tasks();renderHistory();return t}
function approveTask(id){const t=task(id);if(!t)return;t.status='running';logT(t,'▶ Plan approved. Starting.','ok');save.tasks();stepLoop(id);renderHistory()}
function stepLoop(id){
  const t=task(id);if(!t||t.status!=='running')return;
  while(t.idx<t.steps.length&&t.steps[t.idx].skip)t.idx++;
  if(t.idx>=t.steps.length){finishTask(t);return}
  const s=t.steps[t.idx];
  if(s.perm&&!t.perms.some(p=>p.kind===s.perm&&p.granted)){
    if(!t.perms.some(p=>p.kind===s.perm))t.perms.push({id:uid(),kind:s.perm,text:PERM[s.perm].t,solution:PERM[s.perm].s,granted:false});
    t.status='waiting';logT(t,'⏸ Waiting for permission: '+PERM[s.perm].t);save.tasks();refreshAll();return}
  s.state='running';logT(t,'$ '+s.cmd);save.tasks();refreshAll();
  timers[id]=setTimeout(()=>{
    if(!task(id)||t.status!=='running')return;
    if(Math.random()<.12&&!s.retried){s.retried=true;s.state='todo';t.errors.push({step:s.t,msg:'Exit code 1. Auto-retrying once.',at:nowT(),handled:true});logT(t,'✖ Error in "'+s.t+'": exit code 1. Retrying…','err');save.tasks();timers[id]=setTimeout(()=>stepLoop(id),900);return}
    if(s.retried&&Math.random()<.1){t.errors.push({step:s.t,msg:'Failed after one automatic retry',at:nowT(),handled:false});s.state='error';taskFail(t,'"'+s.t+'" failed after one automatic retry. Fix the step or retry the task.');return}
    s.state='done';logT(t,'✓ '+s.t,'ok');t.idx++;
    if(t.idx>=t.steps.length-2&&t.editedFiles.length<t.files.length)t.editedFiles=t.files.slice(0,Math.min(t.files.length,t.editedFiles.length+2));
    else t.editedFiles=t.files.slice(0,Math.min(t.files.length,t.idx));
    save.tasks();refreshAll();timers[id]=setTimeout(()=>stepLoop(id),700)},1100)}
function finishTask(t){t.editedFiles=t.files.slice();logT(t,'• Verifying output against the plan…');
  t.status='completed';const done=t.steps.filter(s=>!s.skip).length;
  t.summary=`${t.title}: ${done} step(s) run and verified. ${t.errors.length} error(s), handled automatically. ${t.files.length} file(s) edited. Status: completed.`;
  logT(t,'✔ Task completed. Report written.','ok');
  if(t.fromAuto){const a=autos.find(x=>x.id===t.fromAuto);if(a){a.reports.unshift({ts:Date.now(),text:t.summary});save.autos()}}
  save.tasks();refreshAll();renderHistory();toast('Task completed: '+t.title)}
function taskFail(t,msg){t.status='failed';t.summary=`${t.title}: failed. ${msg}`;logT(t,'✖ Failed: '+msg,'err');save.tasks();refreshAll()}
function pauseTask(id){const t=task(id);if(!t)return;clearTimeout(timers[id]);t.status='paused';logT(t,'⏸ Paused');save.tasks();refreshAll()}
function resumeTask(id){const t=task(id);if(!t)return;t.status='running';logT(t,'▶ Resumed');save.tasks();stepLoop(id)}
function cancelTask(id){const t=task(id);if(!t)return;clearTimeout(timers[id]);t.status='cancelled';logT(t,'■ Cancelled by user');save.tasks();refreshAll()}
function forceStopAll(){tasks.filter(t=>t.status==='running'||t.status==='waiting').forEach(t=>{clearTimeout(timers[t.id]);t.status='paused';logT(t,'⛔ Force stopped by user','err')});save.tasks();refreshAll();toast('Agent stopped')}
function retryTask(id){const t=task(id);if(!t)return;t.steps.forEach(s=>{if(s.state==='error'||s.state==='running'){s.state='todo';s.retried=false}});t.status='running';logT(t,'↻ Retrying from the failed step','ok');save.tasks();stepLoop(id)}
function grantPerm(tid,pid){const t=task(tid);if(!t)return;const p=t.perms.find(x=>x.id===pid);if(p)p.granted=true;logT(t,'✓ Permission granted: '+(p?p.text:''),'ok');
  if(t.status==='waiting'){t.status='running';save.tasks();stepLoop(tid)}else save.tasks();refreshAll()}
setInterval(()=>{const hm=new Date().toTimeString().slice(0,5),day=new Date().toDateString();
  autos.forEach(a=>{if(a.enabled&&a.time===hm&&a.lastDay!==day){a.lastDay=day;save.autos();runAuto(a.id)}})},30000);
function runAuto(id){const a=autos.find(x=>x.id===id);if(!a)return;const t=createTask(a.instruction,a.name,null,a.id);approveTask(t.id);toast('Automation started: '+a.name)}
function refreshAll(){renderHistory();if($('pgTasks').classList.contains('open'))renderTasksPage();if($('pgTask').classList.contains('open'))renderTask();if($('pgAgent').classList.contains('open'))renderAgent();if($('pgTerminal').classList.contains('open'))renderTerminal();if($('pgPerms').classList.contains('open'))renderPerms();if($('pgLive').classList.contains('open'))renderLive()}
let liveTimer=null;function startLiveTick(){if(!liveTimer)liveTimer=setInterval(()=>{if($('pgLive').classList.contains('open'))renderLive()},1000)}
function stopLiveTick(){if(liveTimer&&!$('pgLive').classList.contains('open')){clearInterval(liveTimer);liveTimer=null}}

/* ---------- Agent folder: Tasks, Automations, Tools, Terminal, Permissions, Planning, Live agent ---------- */
function renderAgent(){
  const r=tasks.find(t=>t.status==='running'),w=tasks.find(t=>t.status==='waiting');
  const sub=r?`Running "${r.title}"`:(w?`Waiting for you on "${w.title}"`:'Idle. No tasks are running.');
  const tile=(g,ic,name,desc,sub2)=>`<button class="tile" data-go="${g}"><svg viewBox="0 0 24 24">${ic}</svg><div><b>${name}</b><small>${desc}</small></div><span class="sub">${sub2||''}</span></button>`;
  $('agentBody').innerHTML=`
   <div class="sec">Agent</div>
   ${tile('tasks','<rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 3 3 5-6"/>','Tasks','Plan, run and verify work',tasks.length||'')}
   ${tile('autos','<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>','Automations','Repeat tasks on a schedule',autos.length||'')}
   ${tile('tools','<path d="M14.5 6.5a4 4 0 0 0 5 5L11 20l-3-3 8.5-8.5a4 4 0 0 0-1-5z"/>','Tools','Installed tools and what they do','')}
   ${tile('terminal','<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>','Terminal','Full-screen shell and saved logs','')}
   ${tile('perms','<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/>','Permissions','Root service, files, accessibility','')}
   ${tile('planning','<path d="M4 6h10M4 12h16M4 18h7"/>','Planning','Plan a project, then make it a task','')}
   ${tile('live','<circle cx="12" cy="12" r="3"/><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>','Live agent',sub,r?'● live':'')}`;
  $('agentBody').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goAgent(b.dataset.go));
  $('agentSub').textContent=r?'Running':'Idle'}
function goAgent(g){({tasks:()=>openTasks(),autos:()=>openAutos(),tools:openTools,terminal:openTerminal,perms:openPerms,planning:()=>openPlanning(),live:openLive})[g]()}

/* ---------- Projects list ---------- */
function renderProjects(){
  $('projBody').innerHTML=`<div class="sec">My projects</div><div class="card" style="padding:0">
    ${projects.map(p=>`<button class="row" data-proj="${p.id}">${svg('folder')}${esc(p.name)}<small>${p.files.length} file(s)</small></button>`).join('')}</div>
    ${projects.length?'':'<div class="empty">No projects yet. Tap "+ New project".</div>'}<button class="bigbtn ghost" id="npBtn2">+ New project</button>`;
  $('projBody').querySelectorAll('[data-proj]').forEach(b=>b.onclick=()=>openProject(b.dataset.proj));
  $('npBtn2').onclick=newProject}
$('newProjBtn').onclick=newProject;
/* ---------- Project: Chat / Files / Preview ---------- */
const PLAY='<path d="M8 5.5v13l11-6.5z"/>',STOP='<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>';
const BIN=/\.(png|jpe?g|gif|webp|ico|pdf|zip|apk|jar|aar|so|class|dex|ttf|otf|woff2?|mp[34]|mov|avi|wav|keystore|jks|bin|exe|dll)$/i,SKIP=/(^|\/)(node_modules|\.git|\.gradle|build|dist|\.idea|__pycache__)(\/|$)/;
const HANDLES={};let edFile=null;
const logoSrc=()=>{const i=document.querySelector('.welcome img');return i?i.src:''};
function treeOf(p){const root={name:p.name,path:'',dir:true,kids:{}};
  const add=(path,dir)=>{let n=root;const parts=path.split('/').filter(Boolean);parts.forEach((s,i)=>{const last=i===parts.length-1,isDir=dir||!last;
    n.kids[s]=n.kids[s]||{name:s,path:parts.slice(0,i+1).join('/'),dir:isDir,kids:{}};n=n.kids[s]})};
  (p.folders||[]).forEach(f=>add(f,true));p.files.forEach(f=>add(f.name,false));return root}
const kidsOf=n=>Object.values(n.kids).sort((a,b)=>(b.dir-a.dir)||a.name.localeCompare(b.name));
function treeText(n,pre=''){let o='';const k=kidsOf(n);k.forEach((c,i)=>{const last=i===k.length-1;o+=pre+(last?'└── ':'├── ')+c.name+(c.dir?'/':'')+'\n';if(c.dir)o+=treeText(c,pre+(last?'    ':'│   '))});return o}
function summarize(p){const ext={};let lines=0;p.files.forEach(f=>{const e=(f.name.match(/\.(\w+)$/)||[,'other'])[1];ext[e]=(ext[e]||0)+1;lines+=(f.content||'').split('\n').length});
  const top=Object.entries(ext).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([e,c])=>c+' .'+e).join(', ');
  const hasWeb=p.files.some(f=>/\.html?$/i.test(f.name)),hasAnd=p.files.some(f=>/build\.gradle|AndroidManifest/i.test(f.name)),hasPy=p.files.some(f=>/\.py$/i.test(f.name));
  const kind=hasAnd?'an Android project':hasWeb?'a web project':hasPy?'a Python project':'a general project';
  return `I looked through "${p.name}". It looks like ${kind}: ${p.files.length} files, about ${lines} lines (${top||'no files yet'}).\n\nFolder structure:\n${treeText(treeOf(p))||'(empty)\n'}`}
const ptype=(p,m)=>{p.chat.push(m);save.projects()};
function genFiles(p,goal){const g=goal.toLowerCase(),title=goal.slice(0,40).replace(/[<>]/g,'');
  if(/html|web|site|page|landing|calculator|game|todo|app/.test(g)&&!/android|apk/.test(g)){
    return[{name:'index.html',content:`<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>\n<link rel="stylesheet" href="style.css"></head>\n<body><main><h1>${title}</h1><p>Built by Echoo agent. Edit this file in the Files tab.</p><button id="go">Tap me</button><p id="out"></p></main>\n<script src="app.js"><\/script></body></html>`},
    {name:'style.css',content:'body{font-family:system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#f6f7fb}\nmain{text-align:center;padding:24px}\nbutton{border:0;border-radius:20px;padding:10px 22px;background:#2f62e8;color:#fff;font-size:16px}'},
    {name:'app.js',content:"document.getElementById('go').onclick=()=>{document.getElementById('out').textContent='Clicked at '+new Date().toLocaleTimeString()};"}]}
  if(/python|script|csv|data|download/.test(g))return[{name:'main.py',content:'# '+title+'\ndef main():\n    print("Hello from Echoo agent")\n\nif __name__ == "__main__":\n    main()\n'},{name:'README.md',content:'# '+title+'\n\nRun: python3 main.py\n'}];
  return[{name:'notes.md',content:'# '+title+'\n\n'+planFromGoal(goal).map((s,i)=>(i+1)+'. '+s.t).join('\n')+'\n'}]}
function drawChat(){const p=projects.find(x=>x.id===openProjId),box=$('prChat');if(!p||!box)return;
  box.innerHTML=p.chat.map((m,i)=>m.r==='run'?`<div class="run" data-i="${i}"><div class="rb"><div class="rs">${m.done?'<b>✓</b>':'<i class="spin"></i>'}<span class="${m.done?'':'shim'}">${esc(m.status)}</span><em class="chev">${m.open?'▴':'▾'}</em></div>${m.open?`<pre class="rlog">${esc(m.log.join('\n'))}</pre>`:''}</div></div>${m.done&&m.result?`<div class="pmsg assistant">${/^\s*(I looked|Folder)/.test(m.result)?'':''}${/\n/.test(m.result)&&m.mono?'':esc(m.result)}</div>`+(m.mono?`<pre class="rlog tree">${esc(m.result)}</pre>`:''):''}`:`<div class="pmsg ${m.r}">${esc(m.t)}</div>`).join('')||'<div class="hint">Give the agent a command, like "make a landing page for my shop".</div>';
  box.querySelectorAll('.run').forEach(el=>el.onclick=()=>{const m=p.chat[+el.dataset.i];m.open=!m.open;save.projects();drawChat()});box.scrollTop=box.scrollHeight}
function agentRun(p,goal,o={}){const steps=o.steps||planFromGoal(goal).slice(0,6);const m={r:'run',status:'Starting…',log:[],open:false,done:false,result:'',mono:!!o.mono};ptype(p,m);let i=0;drawChat();
  const tick=()=>{if(openProjId!==p.id&&!document.body.contains($('prChat'))){}
    if(i>=steps.length){m.done=true;m.status=o.doneText||'Done';m.result=o.result?o.result():('Finished. I created '+(m.made||0)+' file(s) in this project. Open Files to edit, or Preview to run it.');m.log.push('✓ finished');save.projects();drawChat();renderFiles();renderPrev();return}
    const s=steps[i];m.status='Crunching… step '+(i+1)+'/'+steps.length+': '+s.t;m.log.push('$ '+(s.cmd||'echo working'),'  '+s.t+'…');
    if(!o.steps&&i===2){const made=genFiles(p,goal);made.forEach(f=>{const k=p.files.find(x=>x.name===f.name);if(k)k.content=f.content;else p.files.push(f);m.log.push('  wrote '+f.name)});m.made=made.length;p.sel=p.files.findIndex(x=>x.name===made[0].name)}
    i++;save.projects();drawChat();renderFiles();setTimeout(tick,900)};
  setTimeout(tick,500)}
function openProject(id){const p=projects.find(x=>x.id===id);if(!p)return;openProjId=id;p.folders=p.folders||[];$('prTitle').textContent=p.name;
  $('prBody').innerHTML=`
   <div class="col pchat" data-pane="pchat"><div class="colh">Chat</div><div class="colb" id="prChat"></div>
     <div style="padding:8px;display:flex;gap:6px"><input class="fld" id="prIn" placeholder="Tell the agent what to do" style="height:40px"><button class="circlebtn sendbtn" id="prSend" style="width:40px;height:40px">${svg('up','style="transform:rotate(90deg)"')}</button></div></div>
   <div class="col pfiles" data-pane="pfiles"><div class="colh">Files <button class="pill" id="prAdd" style="margin-left:auto;padding:3px 11px">+</button></div><div class="colb" id="prFiles"></div>
     <div style="padding:8px"><button class="bigbtn" id="prPush" style="margin:0;height:42px">Push changes</button></div></div>
   <div class="col ppreview" data-pane="ppreview"><div class="colh">Preview</div><div class="colb" id="prPrev"></div></div>`;
  drawChat();renderFiles();renderPrev();
  $('prSend').onclick=()=>{const v=$('prIn').value.trim();if(!v)return;if(p.chat.length&&p.chat[p.chat.length-1].r==='run'&&!p.chat[p.chat.length-1].done)return toast('Agent is still working');ptype(p,{r:'user',t:v});$('prIn').value='';agentRun(p,v)};
  $('prIn').onkeydown=e=>{if(e.key==='Enter')$('prSend').click()};
  $('prAdd').onclick=()=>newEntry(p,'');$('prPush').onclick=()=>pushProject(p);
  openPage($('pgProject'));setProjTab(prTab);
  if(p.pendingSummary){delete p.pendingSummary;agentRun(p,'',{steps:[{t:'Scanning folders',cmd:'find . -type f'},{t:'Reading file contents',cmd:'cat <files>'},{t:'Writing the summary',cmd:'echo summary'}],mono:true,doneText:'Folder checked',result:()=>summarize(p)})}}
function setProjTab(t){prTab=t;document.querySelectorAll('#prTabs .pill').forEach(b=>b.classList.toggle('on',b.dataset.p===t));
  document.querySelectorAll('#prBody .col').forEach(c=>c.classList.toggle('active',c.dataset.pane===t));if(t==='ppreview')renderPrev()}
document.querySelectorAll('#prTabs .pill').forEach(b=>b.onclick=()=>setProjTab(b.dataset.p));
function renderProj(){drawChat();renderFiles();renderPrev()}
function renderFiles(){const p=projects.find(x=>x.id===openProjId),f=$('prFiles');if(!p||!f)return;p.collapsed=p.collapsed||{};
  const row=(n,last)=>`<div class="tw ${last?'last':''}"><div class="tn ${n.dir?'dir':''} ${!n.dir&&p.files[p.sel||0]&&p.files[p.sel||0].name===n.path?'sel':''}" data-p="${esc(n.path)}" data-d="${n.dir?1:0}"><span class="tc">${n.dir?(p.collapsed[n.path]?'▸':'▾'):''}</span>${svg(n.dir?'folder':'file')}<span class="nm">${esc(n.name)}</span>${p.dirty&&p.dirty[n.path]?'<i class="dot"></i>':''}<button class="more" data-m="${esc(n.path)}" data-d="${n.dir?1:0}">⋯</button></div>${n.dir&&!p.collapsed[n.path]?`<div class="tk">${kidsOf(n).map((c,i,a)=>row(c,i===a.length-1)).join('')}</div>`:''}</div>`;
  const k=kidsOf(treeOf(p));f.innerHTML=`<div class="tk root"><div class="tn rootn">${svg('folder')}<span class="nm"><b>${esc(p.name)}</b></span></div><div class="tk">${k.map((c,i)=>row(c,i===k.length-1)).join('')||'<div class="hint">Empty. Tap + to add a file or folder.</div>'}</div></div>`;
  f.querySelectorAll('.tn[data-p]').forEach(el=>el.onclick=e=>{if(e.target.closest('.more'))return;const path=el.dataset.p;if(el.dataset.d==='1'){p.collapsed[path]=!p.collapsed[path];renderFiles()}else openEditor(p,path)});
  f.querySelectorAll('.more').forEach(b=>b.onclick=e=>{e.stopPropagation();entryMenu(p,b.dataset.m,b.dataset.d==='1')})}
function newEntry(p,base){openSheet(`<h4>New in ${esc(base||p.name)}</h4><input class="fld" id="neName" placeholder="name, or path like src/utils/app.js" autocapitalize="off"><div class="sbtns"><button id="neFolder">Folder</button><button id="neFile" style="background:#111;color:#fff">File</button></div>`,s=>{
  const go=dir=>{let n=s.querySelector('#neName').value.trim().replace(/^\/+|\/+$/g,'');if(!n)return toast('Enter a name');const path=(base?base+'/':'')+n;
    if(p.files.some(x=>x.name===path)||(p.folders||[]).includes(path))return toast('Already exists');
    if(dir){p.folders.push(path)}else{p.files.push({name:path,content:''});p.sel=p.files.length-1;markDirty(p,path)}
    save.projects();closeSheet();renderFiles();if(!dir)setTimeout(()=>openEditor(p,path),250)};
  s.querySelector('#neFolder').onclick=()=>go(true);s.querySelector('#neFile').onclick=()=>go(false)})}
function entryMenu(p,path,dir){openSheet(`<h4>${esc(path.split('/').pop())}</h4>${dir?'<button class="row" id="emNew">New file or folder here</button>':''}<button class="row" id="emRen">Rename</button><button class="row" id="emDel" style="color:#c62828">Delete</button>`,s=>{
  const q=id=>s.querySelector(id);
  if(dir)q('#emNew').onclick=()=>{closeSheet();setTimeout(()=>newEntry(p,path),250)};
  q('#emRen').onclick=()=>{const nn=prompt('New path',path);if(!nn||nn===path)return closeSheet();const re=x=>x===path?nn:x.startsWith(path+'/')?nn+x.slice(path.length):x;
    p.files.forEach(f=>{f.name=re(f.name)});p.folders=p.folders.map(re);markDirty(p,nn);save.projects();closeSheet();renderFiles()};
  q('#emDel').onclick=()=>{p.files=p.files.filter(f=>f.name!==path&&!f.name.startsWith(path+'/'));p.folders=p.folders.filter(f=>f!==path&&!f.startsWith(path+'/'));p.sel=0;save.projects();closeSheet();renderFiles();renderPrev()}})}
function markDirty(p,path){p.dirty=p.dirty||{};p.dirty[path]=1;const parts=path.split('/');for(let i=1;i<parts.length;i++)p.dirty[parts.slice(0,i).join('/')]=1}
/* editor */
function openEditor(p,path){const f=p.files.find(x=>x.name===path);if(!f)return;edFile={p,f};p.sel=p.files.indexOf(f);$('edTitle').textContent=path;const ta=$('edText');ta.value=f.content;lineNums();openPage($('pgEditor'));setTimeout(()=>ta.focus(),350)}
function lineNums(){const ta=$('edText');$('edLines').textContent=Array.from({length:ta.value.split('\n').length},(_, i)=>i+1).join('\n');$('edLines').scrollTop=ta.scrollTop}
function edSave(){if(!edFile)return;edFile.f.content=$('edText').value;markDirty(edFile.p,edFile.f.name);save.projects()}
$('edText').oninput=()=>{lineNums();edSave()};$('edText').onscroll=()=>{$('edLines').scrollTop=$('edText').scrollTop};
$('edText').onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();document.execCommand('insertText',false,'  ')}};
document.querySelectorAll('#edBar button').forEach(b=>b.onclick=async()=>{const ta=$('edText');ta.focus();const k=b.dataset.k;
  if(k==='all')ta.select();
  else if(k==='copy'||k==='cut'){const s=ta.value.slice(ta.selectionStart,ta.selectionEnd);if(!s)return toast('Select text first');await copyText(s);if(k==='cut')document.execCommand('delete');toast(k==='cut'?'Cut':'Copied')}
  else if(k==='paste'){try{const t=await navigator.clipboard.readText();document.execCommand('insertText',false,t)}catch(e){toast('Long-press in the text to paste')}}
  else document.execCommand(k)});
/* push / save to local storage */
const zipOf=files=>{const enc=new TextEncoder(),T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  const crc=b=>{let c=-1;for(const x of b)c=T[(c^x)&255]^(c>>>8);return(c^-1)>>>0};const parts=[],cd=[];let off=0;
  const u16=v=>[v&255,v>>8&255],u32=v=>[v&255,v>>8&255,v>>16&255,v>>24&255];
  files.forEach(f=>{const nm=enc.encode(f.name),d=enc.encode(f.content||''),c=crc(d);
    const h=new Uint8Array([0x50,0x4b,3,4,20,0,0,8,0,0,0,0,0,0,...u32(c),...u32(d.length),...u32(d.length),...u16(nm.length),0,0]);parts.push(h,nm,d);
    cd.push(new Uint8Array([0x50,0x4b,1,2,20,0,20,0,0,8,0,0,0,0,0,0,...u32(c),...u32(d.length),...u32(d.length),...u16(nm.length),0,0,0,0,0,0,0,0,0,0,0,0,...u32(off)]),nm);off+=h.length+nm.length+d.length});
  const cdl=cd.reduce((a,b)=>a+b.length,0);parts.push(...cd,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(cdl),...u32(off),0,0]));return new Blob(parts,{type:'application/zip'})};
async function writeTo(dir,path,content){const parts=path.split('/'),name=parts.pop();for(const s of parts)dir=await dir.getDirectoryHandle(s,{create:true});const fh=await dir.getFileHandle(name,{create:true}),w=await fh.createWritable();await w.write(content);await w.close()}
async function pushProject(p){let h=HANDLES[p.id];
  try{if(!h&&window.showDirectoryPicker){toast('Choose your Echoo folder in storage');const root=await showDirectoryPicker({mode:'readwrite'});h={dir:root,sub:true};HANDLES[p.id]=h}
    if(h){let d=h.dir;if(h.sub)d=await d.getDirectoryHandle(p.name.replace(/[^\w.-]+/g,'_'),{create:true});
      for(const f of p.folders||[])await writeTo(d,f+'/.keep','');for(const f of p.files)await writeTo(d,f.name,f.content||'');
      p.dirty={};save.projects();renderFiles();toast('Pushed '+p.files.length+' file(s) to the folder');return}}
  catch(e){if(e.name==='AbortError')return;toast('Could not write to folder, saving a zip instead')}
  const a=document.createElement('a');a.href=URL.createObjectURL(zipOf(p.files));a.download='echoo-'+p.name.replace(/[^\w.-]+/g,'_')+'.zip';a.click();p.dirty={};save.projects();renderFiles();toast('Saved as zip in Downloads')}
/* preview */
function inlineAssets(html,p){const get=n=>{const f=p.files.find(x=>x.name===n.replace(/^\.?\//,''));return f?f.content:null};
  return html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,(m,h)=>{const c=get(h);return c==null?m:'<style>'+c+'</style>'})
    .replace(/<script([^>]*)src=["']([^"']+\.js)["']([^>]*)><\/script>/gi,(m,a,s,b)=>{const c=get(s);return c==null?m:'<script'+a+b+'>'+c.replace(/<\/script/gi,'<\\/script')+'<\/script>'})}
function pickPreview(p){const i=p.files.findIndex(f=>/(^|\/)index\.html?$/i.test(f.name));return i>=0?i:p.files.findIndex(f=>/\.html?$/i.test(f.name))}
function renderPrev(){const p=projects.find(x=>x.id===openProjId),b=$('prPrev');if(!p||!b)return;
  let i=p.sel||0;if(!p.files[i]||!/\.html?$/i.test(p.files[i].name)){const j=pickPreview(p);if(j>=0)i=j}const f=p.files[i];
  b.innerHTML=`<div class="hint" style="margin:0 0 8px">${f?'File: <b>'+esc(f.name)+'</b>':'No file to preview yet.'}</div>
   <button class="bigbtn" id="pvLive" style="margin:0 0 8px">Live preview on this device</button>
   <button class="bigbtn ghost" id="pvTest" style="margin:0 0 8px">Test by agent</button>
   ${f&&/\.html?$/i.test(f.name)?`<iframe class="previewbox" sandbox="allow-scripts" srcdoc="${esc(inlineAssets(f.content,p))}"></iframe>`:''}
   <div id="pvOut"></div>`;
  $('pvLive').onclick=()=>{if(!f)return toast('Create a file first');const html=/\.html?$/i.test(f.name);
    const u=URL.createObjectURL(new Blob([html?inlineAssets(f.content,p):f.content],{type:html?'text/html':'text/plain'}));if(!window.open(u,'_blank'))location.href=u};
  $('pvTest').onclick=()=>testByAgent(p)}
async function testByAgent(p){if(!p.files.length)return toast('No files to check');const out=$('pvOut');if(out.dataset.busy)return;out.dataset.busy=1;
  out.innerHTML='<div class="rb" style="margin-top:8px"><div class="rs"><i class="spin"></i><span class="shim" id="rvSt">Agent is reviewing the project…</span></div><pre class="rlog open" id="rvLog"></pre></div>';
  const log=$('rvLog'),put=async(t,cls)=>{log.innerHTML+=`<span class="${cls||''}">${esc(t)}</span>\n`;log.scrollTop=log.scrollHeight;await sleep(cls==='h'?420:230)};
  const R=[];const err=(f,m)=>{R.push({f,m,t:'e'});return put('  ✖ '+m,'er')},wr=(f,m)=>{R.push({f,m,t:'w'});return put('  ! '+m,'wa')},ok=m=>put('  ✓ '+m,'ok');
  const htmlIds=new Set(),has=n=>p.files.some(x=>x.name===n.replace(/^\.?\//,''));
  p.files.filter(x=>/\.html?$/i.test(x.name)).forEach(x=>new DOMParser().parseFromString(x.content,'text/html').querySelectorAll('[id]').forEach(e=>htmlIds.add(e.id)));
  await put('$ review '+p.files.length+' file(s) in '+p.name,'h');
  for(const f of p.files){const lines=(f.content||'').split('\n');$('rvSt')&&($('rvSt').textContent='Checking '+f.name);
    await put('→ '+f.name+'  ('+lines.length+' lines)','h');
    if(!f.content.trim()){await wr(f.name,f.name+': file is empty');continue}
    let found=0;for(let i=0;i<lines.length;i++){const l=lines[i];
      if(/\b(TODO|FIXME)\b/.test(l)){await wr(f.name,`${f.name}:${i+1} has a TODO/FIXME note`);found++}
      if(/\bdebugger\b/.test(l)){await wr(f.name,`${f.name}:${i+1} leftover debugger statement`);found++}
      if(/\bconsole\.log\(/.test(l)&&/\.(js|html?)$/i.test(f.name)){await wr(f.name,`${f.name}:${i+1} console.log left in code`);found++}
      if(l.length>400){await wr(f.name,`${f.name}:${i+1} very long line (${l.length} chars)`);found++}}
    await ok('read all '+lines.length+' lines'+(found?'':', nothing odd per line'));
    if(/\.html?$/i.test(f.name)){const doc=new DOMParser().parseFromString(inlineAssets(f.content,p),'text/html');
      doc.title?await ok('title: '+doc.title):await wr(f.name,f.name+': no <title>');
      doc.querySelector('meta[name=viewport]')?await ok('mobile viewport set'):await wr(f.name,f.name+': no viewport meta tag, may look tiny on phones');
      const ids={};doc.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);for(const k of Object.keys(ids).filter(k=>ids[k]>1))await err(f.name,`${f.name}: duplicate id "${k}"`);
      let n=0;for(const s of doc.querySelectorAll('script')){n++;if(s.src){await err(f.name,`${f.name}: script file missing (${s.getAttribute('src')})`);continue}try{new Function(s.textContent);await ok('script '+n+' syntax is fine')}catch(e){await err(f.name,`${f.name}: script ${n}: ${e.message}`)}}
      for(const l of doc.querySelectorAll('link[rel=stylesheet]')){const h=l.getAttribute('href');if(!/^https?:/.test(h))await err(f.name,`${f.name}: stylesheet missing (${h})`)}
      for(const im of doc.querySelectorAll('img[src]')){const s=im.getAttribute('src');if(!/^(https?:|data:|blob:)/.test(s)&&!has(s))await err(f.name,`${f.name}: image missing (${s})`)}
      for(const a of doc.querySelectorAll('a[href]')){const h=a.getAttribute('href');if(/^[\w./-]+\.html?$/.test(h)&&!has(h))await wr(f.name,`${f.name}: link to missing page (${h})`)}}
    else if(/\.js$/i.test(f.name)){try{new Function(f.content);await ok('JavaScript syntax is fine')}catch(e){await err(f.name,`${f.name}: ${e.message}`)}
      for(const m of [...f.content.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)]){if(htmlIds.size&&!htmlIds.has(m[1]))await err(f.name,`${f.name}: looks for #${m[1]} but no HTML file has that id`)}}
    else if(/\.css$/i.test(f.name)){const o=(f.content.match(/{/g)||[]).length,c=(f.content.match(/}/g)||[]).length;o===c?await ok('braces balanced ('+o+' rules)'):await err(f.name,`${f.name}: ${o} "{" but ${c} "}"`)}
    else if(/\.json$/i.test(f.name)){try{JSON.parse(f.content);await ok('valid JSON')}catch(e){await err(f.name,`${f.name}: ${e.message}`)}}
    else if(/\.py$/i.test(f.name)){const bal=['()','[]','{}'].every(([a,b])=>(f.content.split(a).length-1)===(f.content.split(b).length-1));bal?await ok('brackets balanced'):await err(f.name,f.name+': unbalanced brackets');
      /\t/.test(f.content)&&/^ +\S/m.test(f.content)&&await err(f.name,f.name+': mixes tabs and spaces for indentation')}
    else await ok('readable text file')}
  const E=R.filter(x=>x.t==='e'),W=R.filter(x=>x.t==='w');await put('— review finished —','h');
  let verdict;if(typeof window.echooReview==='function'){try{verdict=await window.echooReview({project:p.name,files:p.files,findings:R})}catch(e){}}
  if(!verdict)verdict=E.length?`Not ready yet. ${E.length} problem(s) need fixing:\n`+E.map(x=>'• '+x.m).join('\n')+(W.length?`\nAlso ${W.length} smaller thing(s) to tidy up.`:''):W.length?`Looks good and should run. ${W.length} small thing(s) worth tidying:\n`+W.slice(0,6).map(x=>'• '+x.m).join('\n'):`All ${p.files.length} file(s) checked line by line. Everything looks correct.`;
  out.dataset.busy='';const st=$('rvSt');if(st){st.className='';st.textContent=E.length?E.length+' error(s), '+W.length+' warning(s)':'Review done: '+(W.length?W.length+' warning(s)':'all good')}
  const sp=out.querySelector('.spin');if(sp)sp.outerHTML='<b style="color:'+(E.length?'#e5484d':'#1b9e4b')+'">'+(E.length?'✖':'✓')+'</b>';
  out.insertAdjacentHTML('beforeend','<div class="pmsg assistant" style="margin-top:8px">'+esc(verdict)+'</div>')}
/* new project: empty or from a folder */
function newProject(){openSheet(`<h4>New project</h4><p>Give it a name, or pick a folder on your device for the agent to work on.</p><input class="fld" id="npName" placeholder="Project name" maxlength="40"><div class="sbtns"><button id="npFolder">Select folder</button><button id="npYes" style="background:#111;color:#fff">Create</button></div><input hidden type="file" id="npDir" webkitdirectory multiple>`,s=>{
  const finish=(p)=>{projects.unshift(p);save.projects();closeSheet();renderProjects();if(pages.length&&pages[pages.length-1].id==='pgAgent')renderAgent();openProject(p.id)};
  s.querySelector('#npYes').onclick=()=>{const n=s.querySelector('#npName').value.trim();if(!n)return toast('Enter a name');finish({id:uid(),name:n,files:[{name:'README.md',content:'# '+n+'\n\nDescribe the project here.'}],folders:[],chat:[]})};
  const typed=()=>s.querySelector('#npName').value.trim();
  s.querySelector('#npFolder').onclick=async()=>{
    if(window.showDirectoryPicker){try{const dir=await showDirectoryPicker({mode:'readwrite'});toast('Reading folder…');const files=[],folders=[];
      const walk=async(d,pre)=>{for await(const[nm,h]of d.entries()){const path=pre+nm;if(SKIP.test(path+'/'))continue;if(files.length>400)return;
        if(h.kind==='directory'){folders.push(path);await walk(h,path+'/')}else if(!BIN.test(nm)){const fl=await h.getFile();if(fl.size<400000)files.push({name:path,content:await fl.text()})}}};
      await walk(dir,'');const p={id:uid(),name:typed()||dir.name,files,folders,chat:[],pendingSummary:true};HANDLES[p.id]={dir,sub:false};finish(p)}catch(e){if(e.name!=='AbortError')toast('Could not open the folder')}}
    else s.querySelector('#npDir').click()};
  s.querySelector('#npDir').onchange=async e=>{const list=[...e.target.files];if(!list.length)return;toast('Reading folder…');const files=[],name=list[0].webkitRelativePath.split('/')[0];
    for(const fl of list){const path=fl.webkitRelativePath.split('/').slice(1).join('/');if(!path||SKIP.test(path+'/')||BIN.test(path)||fl.size>400000||files.length>400)continue;files.push({name:path,content:await fl.text()})}
    finish({id:uid(),name:typed()||name,files,folders:[],chat:[],pendingSummary:true,note:'no-write'})}})}

/* ---------- Tasks ---------- */
function openTasks(newOne){openPage($('pgTasks'));renderTasksPage();if(newOne)newTask()}
function renderTasksPage(){
  const c=s=>tasks.filter(t=>t.status===s).length;const list=tasks.filter(t=>t.status!=='plan');
  $('sTotal').textContent=list.length;$('sRun').textContent=c('running');$('sWait').textContent=tasks.filter(t=>['waiting','paused'].includes(t.status)).length;$('sDone').textContent=c('completed');$('sFail').textContent=c('failed');
  document.querySelectorAll('#taskTabs .pill').forEach(p=>p.classList.toggle('on',p.dataset.tab===taskTab));
  const body=$('taskTabBody');
  if(taskTab==='results'){body.innerHTML=list.length?list.map(taskCard).join(''):'<div class="empty">No tasks yet. Tap "+ New task" to start.</div>';bindTaskCards(body)}
  if(taskTab==='errors'){const errs=list.flatMap(t=>t.errors.map(e=>({t,e})));body.innerHTML=errs.length?errs.map(({t,e})=>`<div class="item" data-id="${t.id}"><div class="t"><span>${esc(t.title)}</span><span class="badge b-${t.status}">${t.status}</span></div><div class="m">Step: ${esc(e.step)}<br>${esc(e.msg)} · ${e.at} · ${e.handled?'handled automatically':'needs you'}</div></div>`).join(''):'<div class="empty">No errors. Everything is running clean.</div>';bindTaskCards(body)}
  if(taskTab==='perms'){const ps=list.flatMap(t=>t.perms.filter(p=>!p.granted).map(p=>({t,p})));body.innerHTML=ps.length?ps.map(({t,p})=>`<div class="card" style="padding:14px"><b>${esc(p.text)}</b><div class="muted" style="margin-top:4px">Task: ${esc(t.title)}</div><div class="note" style="margin:10px 0 0"><b>What to do:</b> ${esc(p.solution)}</div><button class="bigbtn" data-grant="${t.id}|${p.id}">Grant</button></div>`).join(''):'<div class="empty">No permission requests right now.</div>';
    body.querySelectorAll('[data-grant]').forEach(b=>b.onclick=()=>{const[a,c]=b.dataset.grant.split('|');grantPerm(a,c)})}
  if(taskTab==='summary'){const done=list.filter(t=>t.summary);body.innerHTML=`<div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><b>${list.length}</b><span>Tasks run</span></div><div class="stat"><b>${list.reduce((n,t)=>n+t.errors.length,0)}</b><span>Errors handled</span></div></div>`+(done.length?done.map(t=>`<div class="card" style="padding:14px"><b>${esc(t.title)}</b><div class="muted" style="margin-top:6px;line-height:1.5">${esc(t.summary)}</div></div>`).join(''):'<div class="empty">No summary yet. Summaries appear when tasks finish.</div>')}}
function taskCard(t){const pct=pctOf(t);return `<div class="item" data-id="${t.id}"><div class="t"><span>${esc(t.title)}</span><span class="badge b-${t.status}">${t.status}</span></div><div class="bar"><i style="width:${pct}%"></i></div><div class="m">${pct}% · ${t.logs.length} log lines${t.fromAuto?' · from automation':''}</div><button class="pill danger" data-tdel="${t.id}" style="margin-top:8px">Delete</button></div>`}
const pctOf=t=>t.steps.length?Math.round(t.steps.filter(s=>s.state==='done'||s.skip).length/t.steps.length*100):0;
function bindTaskCards(root){root.querySelectorAll('.item[data-id]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-tdel]'))return confirmDelete('task',el.dataset.id);openTask(el.dataset.id)})}
document.querySelectorAll('#taskTabs .pill').forEach(p=>p.onclick=()=>{taskTab=p.dataset.tab;renderTasksPage()});
$('newTaskBtn').onclick=()=>newTask();

/* New task: planning box with +, mic, editable steps and a refine box that can be used again and again */
function newTask(){openPage($('pgNewTask'));
  $('newTaskBody').innerHTML=`<div class="lbl">What should the agent do?</div>
   <div class="tbox"><textarea class="fld" id="ntGoal" placeholder="e.g. Build an Android APK app for my shop" style="min-height:120px"></textarea><button class="tmic" id="ntMic" title="Speak">${svg('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>')}</button></div>
   <button class="bigbtn" id="ntPlan">Create plan with AI</button><div id="ntOut"></div>`;
  $('ntMic').onclick=()=>dictateInto('ntGoal');
  $('ntPlan').onclick=()=>{const g=$('ntGoal').value.trim();if(!g)return toast('Describe the task first');showPlan(g)}}
function dictateInto(id){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return toast('Speech input is not supported here');
  const r=new SR();r.lang='en-IN';r.interimResults=true;const el=$(id),base=el.value.trim();r.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;el.value=[base,s].filter(Boolean).join(' ')};r.start();toast('Listening…')}
let planState=null;
function showPlan(goal){planState={goal,steps:planFromGoal(goal)};renderPlan()}
function renderPlan(){const ps=planState;const out=$('ntOut');
  out.innerHTML=`<div class="sec">Plan (edit, skip or add steps)</div><div class="card" style="padding:4px 14px"><ul class="steps" id="planSteps">${ps.steps.map((s,i)=>`<li class="${s.skip?'skipped':''}"><span class="sn">${i+1}</span><div style="flex:1;min-width:0"><input class="stepin" value="${esc(s.t)}" data-i="${i}"><div class="cmd">${esc(s.cmd)}</div>${s.perm?`<div class="muted" style="font-size:12px">Needs permission: ${PERM[s.perm].t}</div>`:''}</div><button class="sk" data-skip="${i}">${s.skip?'Unskip':'Skip'}</button><button class="sk" data-del="${i}" style="color:#c62828">×</button></li>`).join('')}</ul></div>
  <div style="display:flex;gap:8px;margin-top:8px"><input class="fld" id="addStep" placeholder="Add a step…" style="flex:1"><button class="circlebtn" id="addStepBtn" title="Add step" style="border:1px solid var(--line);background:var(--card)">${svg('plus')}</button><button class="circlebtn" id="addStepMic" title="Speak step" style="border:1px solid var(--line);background:var(--card)">${svg('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>')}</button></div>
  <div style="display:flex;gap:8px;margin-top:8px"><input class="fld" id="refine" placeholder="Refine the plan: describe a change…" style="flex:1"><button class="pill" id="refineBtn">Update plan</button></div>
  <div class="note"><b>Next:</b> the agent runs the steps, verifies them, fixes errors in another step, and writes a report.</div>
  <button class="bigbtn" id="planApprove">Approve and run</button><button class="bigbtn ghost" id="planSave">Save as automation</button>`;
  out.querySelectorAll('.stepin').forEach(inp=>inp.oninput=()=>{ps.steps[+inp.dataset.i].t=inp.value});
  out.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{const s=ps.steps[+b.dataset.skip];s.skip=!s.skip;renderPlan()});
  out.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ps.steps.splice(+b.dataset.del,1);renderPlan()});
  const addStep=v=>{if(!v)return;ps.steps.splice(ps.steps.length-2,0,{t:v,cmd:'python3 step.py "'+v.slice(0,30)+'"',skip:false,state:'todo',retried:false,id:uid()});renderPlan()};
  $('addStepBtn').onclick=()=>addStep($('addStep').value.trim());
  $('addStep').onkeydown=e=>{if(e.key==='Enter')addStep($('addStep').value.trim())};
  $('addStepMic').onclick=()=>dictateInto('addStep');
  const refine=()=>{const v=$('refine').value.trim();if(!v)return;ps.steps.splice(ps.steps.length-2,0,{t:'Refinement: '+v,cmd:'python3 refine.py',skip:false,state:'todo',retried:false,id:uid()});$('refine').value='';renderPlan();toast('Plan updated')};
  $('refineBtn').onclick=refine;$('refine').onkeydown=e=>{if(e.key==='Enter')refine()};
  $('planApprove').onclick=()=>{const t=createTask(ps.goal,null,ps.steps.map((s,i)=>({...s,id:i})));closeAllPagesTo(0);openPage($('pgTasks'));openTask(t.id);approveTask(t.id)};
  $('planSave').onclick=()=>openAutoEdit(null,ps.goal)}

/* Task page: Plan → Execute → Verify stages, chat to discuss the plan, edited files at the bottom */
function openTask(id){const t=task(id);if(!t)return;openTaskId=id;openPage($('pgTask'));renderTask()}
function stageOf(t){if(t.status==='plan')return 0;if(t.status==='completed'||(t.idx>=t.steps.length-1&&t.status==='running'&&t.steps[t.steps.length-1].state==='running'))return 2;return 1}
function renderTask(){const t=task(openTaskId);if(!t)return;$('tdTitle').textContent=t.title;
  const pct=pctOf(t),st=stageOf(t);
  let actions='';
  if(t.status==='plan')actions+=`<button class="pill on" data-a="approve">Approve and run</button>`;
  if(t.status==='running')actions+=`<button class="pill" data-a="pause">Pause</button>`;
  if(t.status==='paused')actions+=`<button class="pill" data-a="resume">Resume</button>`;
  if(t.status==='failed')actions+=`<button class="pill" data-a="retry">Retry</button>`;
  if(['running','paused','waiting','failed'].includes(t.status))actions+=`<button class="pill danger" data-a="cancel">Cancel</button>`;
  actions+=`<button class="pill" data-a="auto">Save as automation</button><button class="pill danger" data-a="delete">Delete task</button>`;
  const stages=['Plan','Execute','Verify'].map((n,i)=>`<span class="pill ${i===st?'on':''}" style="${i<st?'opacity:.6':''}">${i<st?'✓ ':''}${n}</span>`).join('');
  $('taskBody').innerHTML=`
   <div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:center"><span class="badge b-${t.status}">${t.status}</span><span class="muted">${pct}%</span></div><div class="bar"><i style="width:${pct}%"></i></div><div class="muted" style="margin-top:8px;font-size:13px">${esc(t.goal)}</div></div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">${stages}</div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${actions}</div>
   ${t.perms.filter(p=>!p.granted).map(p=>`<div class="note"><b>Permission needed: ${esc(p.text)}</b><br>${esc(p.solution)}<br><button class="pill" style="margin-top:8px" data-grant="${p.id}">Grant</button></div>`).join('')}
   <div class="sec">Plan and steps</div><div class="card" style="padding:4px 14px"><ul class="steps">${t.steps.map((s,i)=>{const cls=s.skip?'skipped':s.state;return `<li class="${cls}"><span class="sn">${s.state==='done'?'✓':i+1}</span><div style="flex:1;min-width:0">${esc(s.t)}<div class="cmd">${esc(s.cmd)}</div></div>${t.status==='plan'||(!['done'].includes(s.state))?`<button class="sk" data-skip="${i}">${s.skip?'Unskip':'Skip'}</button>`:''}</li>`}).join('')}</ul></div>
   <div class="sec">Discuss the plan</div><div class="card" style="padding:10px">${t.chat.map(m=>`<div class="pmsg ${m.r}">${esc(m.t)}</div>`).join('')||'<div class="hint">Ask the agent how it will do this, or suggest a change. It will update the plan.</div>'}
     <div style="display:flex;gap:6px;margin-top:6px"><input class="fld" id="tdChatIn" placeholder="Suggest a change…" style="height:40px"><button class="pill" id="tdChatSend">Send</button></div></div>
   <div class="sec">Live log</div><div class="term" id="taskLog">${t.logs.map(l=>`<div class="${l.cls}">[${l.ts}] ${esc(l.line)}</div>`).join('')||'<span style="color:#777">Waiting for the first command…</span>'}</div>
   ${t.editedFiles.length?`<div class="sec">${t.editedFiles.length} file(s) edited</div><div class="card">${t.editedFiles.map(f=>`<div class="row" style="cursor:default">${svg('file')}<span style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px;overflow:hidden;text-overflow:ellipsis">${esc(f)}</span></div>`).join('')}</div>`:''}
   <div class="sec">Report</div><div class="card" style="padding:14px;font-size:14px;line-height:1.5">${t.summary?esc(t.summary):'<span class="muted">The report appears when the task finishes.</span>'}</div>`;
  const B=$('taskBody');
  B.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
    if(a==='approve')approveTask(t.id);if(a==='pause')pauseTask(t.id);if(a==='resume')resumeTask(t.id);if(a==='retry')retryTask(t.id);if(a==='cancel')cancelTask(t.id);if(a==='auto')openAutoEdit(null,t.goal);if(a==='delete')confirmDelete('task',t.id)});
  B.querySelectorAll('[data-grant]').forEach(b=>b.onclick=()=>grantPerm(t.id,b.dataset.grant));
  B.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{const s=t.steps[+b.dataset.skip];s.skip=!s.skip;save.tasks();renderTask()});
  const send=()=>{const v=$('tdChatIn').value.trim();if(!v)return;t.chat.push({r:'user',t:v});
    t.chat.push({r:'assistant',t:'Understood. I added this to the plan: "'+v+'". I\'ll run it before verification.'});
    t.steps.splice(Math.max(0,t.steps.length-2),0,{id:uid(),t:'Change requested: '+v,cmd:'python3 change.py',skip:false,state:'todo',retried:false});save.tasks();renderTask()};
  $('tdChatSend').onclick=send;$('tdChatIn').onkeydown=e=>{if(e.key==='Enter')send()};
  const lg=$('taskLog');if(lg)lg.scrollTop=lg.scrollHeight}

/* ---------- Automations ---------- */
function openAutos(id){openPage($('pgAutos'));renderAutos();if(id)setTimeout(()=>{if(autos.find(x=>x.id===id))openAutoEdit(id)},0)}
function renderAutos(){
  $('autoBody').innerHTML=autos.length?autos.map(a=>`<div class="item">
    <div class="t"><span>${esc(a.name)}</span><span class="badge ${a.enabled?'b-completed':'b-paused'}">${a.enabled?'Active':'Paused'}</span></div>
    <div class="m">Runs daily at ${esc(a.time)} · ${a.reports.length} report(s)</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
      <button class="pill" data-run="${a.id}">Run now</button><button class="pill" data-edit="${a.id}">Edit routine</button><button class="pill" data-rep="${a.id}">Report</button><button class="pill" data-tog="${a.id}">${a.enabled?'Pause':'Resume'}</button><button class="pill danger" data-del="${a.id}">Delete</button>
    </div></div>`).join(''):'<div class="empty">No automations yet. An automation repeats a task every day at the time you choose.</div>';
  const on=(sel,fn)=>$('autoBody').querySelectorAll(sel).forEach(b=>b.onclick=e=>{e.stopPropagation();fn(b)});
  on('[data-run]',b=>runAuto(b.dataset.run));
  on('[data-edit]',b=>openAutoEdit(b.dataset.edit));
  on('[data-tog]',b=>{const a=autos.find(x=>x.id===b.dataset.tog);a.enabled=!a.enabled;save.autos();renderAutos();renderHistory()});
  on('[data-rep]',b=>{const a=autos.find(x=>x.id===b.dataset.rep);openSheet(`<h4>${esc(a.name)} · Report</h4>${a.reports.length?a.reports.slice(0,8).map(r=>`<p style="color:var(--fg)">${new Date(r.ts).toLocaleString()}<br>${esc(r.text)}</p>`).join(''):'<p>No runs yet. Tap Run now to test it.</p>'}<div class="sbtns"><button id="rOk">Close</button></div>`,s=>s.querySelector('#rOk').onclick=closeSheet)});
  on('[data-del]',b=>openSheet(`<h4>Delete automation?</h4><p>Its reports will be removed too.</p><div class="sbtns"><button id="dNo">Cancel</button><button class="dang" id="dYes">Delete</button></div>`,s=>{s.querySelector('#dNo').onclick=closeSheet;s.querySelector('#dYes').onclick=()=>{autos=autos.filter(x=>x.id!==b.dataset.del);save.autos();closeSheet();renderAutos();renderHistory()}}))}
$('newAutoBtn').onclick=()=>openAutoEdit(null);
function openAutoEdit(id,prefill){const a=id?autos.find(x=>x.id===id):null;
  $('aeTitle').textContent=a?'Edit routine':'New automation';openPage($('pgAutoEdit'));
  $('autoEditBody').innerHTML=`<div class="lbl">Automation name</div><input class="fld" id="aName" value="${esc(a?a.name:'')}" maxlength="40" placeholder="e.g. Daily invoice summary">
   <div class="lbl">Tell the agent what to do</div><textarea class="fld" id="aInstr" placeholder="Describe the routine">${esc(a?a.instruction:(prefill||''))}</textarea>
   <div class="lbl">Run every day at</div><input class="fld" id="aTime" type="time" value="${esc(a?a.time:'09:00')}">
   <button class="bigbtn ghost" id="aAi">Set up with AI</button><div id="aSetup"></div>
   <button class="bigbtn" id="aSave">${a?'Save routine':'Save automation'}</button>`;
  $('aAi').onclick=()=>{const ins=$('aInstr').value.trim();if(!ins)return toast('Describe what to do first');const steps=planFromGoal(ins);
    $('aSetup').innerHTML=`<div class="sec">AI setup</div><div class="card" style="padding:4px 14px"><ul class="steps">${steps.map((s,i)=>`<li><span class="sn">${i+1}</span><div>${esc(s.t)}<div class="cmd">${esc(s.cmd)}</div></div></li>`).join('')}</ul></div><p class="hint">Runs every day at ${esc($('aTime').value)}. Review the steps, then save.</p>`};
  $('aSave').onclick=()=>{const name=$('aName').value.trim(),ins=$('aInstr').value.trim(),time=$('aTime').value;
    if(!name||!ins||!time)return toast('Fill in name, instruction and time');
    if(a){Object.assign(a,{name,instruction:ins,time});toast('Routine updated')}
    else{autos.unshift({id:uid(),name,instruction:ins,time,enabled:true,createdAt:Date.now(),reports:[],lastDay:null});toast('Automation saved')}
    save.autos();renderAutos();renderHistory();closePage();if(!$('pgAutos').classList.contains('open'))openPage($('pgAutos'))}}

/* ---------- Planning: longer plans, edit steps, convert ---------- */
function openPlanning(text,kind){openPage($('pgPlanning'));
  $('planBody').innerHTML=`<div class="lbl">Describe your project or goal</div>
   <div class="tbox"><textarea class="fld" id="plGoal" placeholder="e.g. Every morning, collect new invoices from my folder and make a summary sheet" style="min-height:120px">${esc(text||'')}</textarea><button class="tmic" id="plMic" title="Speak">${svg('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>')}</button></div>
   <button class="bigbtn" id="plMake">Create plan</button><div id="plOut"></div>`;
  $('plMic').onclick=()=>dictateInto('plGoal');
  $('plMake').onclick=()=>{const g=$('plGoal').value.trim();if(!g)return toast('Describe the goal first');showPlanningPlan(g)};
  if(kind==='task'&&text)showPlanningPlan(text)}
function showPlanningPlan(g){planState={goal:g,steps:planFromGoal(g)};
  const out=$('plOut');out.innerHTML=`<div class="sec">Plan (edit, skip or add steps)</div><div id="plPlanBox"></div>
    <button class="bigbtn" id="plTask">Convert to task</button><button class="bigbtn ghost" id="plAuto">Convert to automation</button><button class="bigbtn ghost" id="plChat">Chat about this</button>`;
  const box=$('plPlanBox');const renderBox=()=>{const cont=document.createElement('div');cont.innerHTML='';box.innerHTML='';
    const tmp=$('ntOut');const hold=tmp?tmp.innerHTML:null;
    box.innerHTML=`<div class="card" style="padding:4px 14px"><ul class="steps">${planState.steps.map((s,i)=>`<li class="${s.skip?'skipped':''}"><span class="sn">${i+1}</span><div style="flex:1;min-width:0"><input class="stepin" value="${esc(s.t)}" data-i="${i}"><div class="cmd">${esc(s.cmd)}</div></div><button class="sk" data-skip="${i}">${s.skip?'Unskip':'Skip'}</button><button class="sk" data-del="${i}" style="color:#c62828">×</button></li>`).join('')}</ul></div>
      <div style="display:flex;gap:8px;margin-top:8px"><input class="fld" id="plRefine" placeholder="Add or change a step…" style="flex:1"><button class="pill" id="plRefineBtn">Add</button></div>`;
    box.querySelectorAll('.stepin').forEach(inp=>inp.oninput=()=>{planState.steps[+inp.dataset.i].t=inp.value});
    box.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{const s=planState.steps[+b.dataset.skip];s.skip=!s.skip;renderBox()});
    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{planState.steps.splice(+b.dataset.del,1);renderBox()});
    const add=()=>{const v=$('plRefine').value.trim();if(!v)return;planState.steps.splice(Math.max(0,planState.steps.length-2),0,{t:v,cmd:'python3 step.py',skip:false,state:'todo',retried:false,id:uid()});renderBox()};
    $('plRefineBtn').onclick=add;$('plRefine').onkeydown=e=>{if(e.key==='Enter')add()}};
  renderBox();
  $('plTask').onclick=()=>{const t=createTask(planState.goal,null,planState.steps.map((s,i)=>({...s,id:i})));closeAllPagesTo(0);openPage($('pgTasks'));openTask(t.id)};
  $('plAuto').onclick=()=>openAutoEdit(null,planState.goal);
  $('plChat').onclick=()=>{closeAllPagesTo(0);newChat();$('prompt').value=planState.goal;autoGrow();$('prompt').focus()}}

/* ---------- Terminal: Termux look, sessions [1] [2] [3], download/delete beside each number ---------- */
const TERM_WELCOME='Welcome to '+'\x1b[32mTermux\x1b[0m\n\nDocs:       https://doc.termux.com\nCommunity:  https://community.termux.com\n\nWorking with packages:\n - Search:  pkg search <query>\n - Install: pkg install <package>\n - Upgrade: pkg upgrade\n\nReport issues at https://bugs.termux.com\n\n';
let sessions=LS.get('termSess',null)||[{n:1,log:TERM_WELCOME}];
let actSess=0;
const TI={dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',del:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',kb:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',plus:'<path d="M12 5v14M5 12h14"/>',term:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>'};
const tsvg=(k,st='')=>`<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;${st}">${TI[k]}</svg>`;
const A=(c,s)=>`\x1b[${c}m${s}\x1b[0m`;
function termLogAdd(str,i){if(i===undefined)i=actSess;sessions[i].log+=str;save.term()}
function ansiHtml(s){const C={30:'#555',31:'#ff5f56',32:'#27c93f',33:'#ffbd2e',34:'#5aa2ff',35:'#d78bff',36:'#35d4d4',37:'#eee',90:'#8a8a8a',91:'#ff7b72',92:'#56e07a',93:'#ffd866',94:'#79b8ff',96:'#5ee5e5'};
  let out='',open=0;s=esc(s).replace(/\r/g,'');
  out=s.replace(/\x1b\[([\d;]*)m/g,(m,c)=>{let r=open?'</span>':'';open=0;const codes=c.split(';').filter(Boolean);if(!codes.length||codes[0]==='0')return r;
    let st='';codes.forEach(k=>{if(k==='1')st+='font-weight:700;';else if(C[k])st+='color:'+C[k]+';'});if(st){open=1;r+=`<span style="${st}">`}return r});
  return out+(open?'</span>':'')}
const stripAnsi=s=>s.replace(/\x1b\[[\d;]*m/g,'');
function paintLog(){const el=$('tLog');if(!el)return;el.innerHTML=ansiHtml(sessions[actSess].log);const o=$('termOut');o.scrollTop=o.scrollHeight}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function termPrint(si,lines,delay=160){for(const l of lines){sessions[si].log+=l+'\n';save.term();if(si===actSess)paintLog();await sleep(delay)}}
async function termProgress(si,label,ms=1400){const base=sessions[si].log,steps=24;
  for(let i=0;i<=steps;i++){const pct=Math.round(i/steps*100),fill='█'.repeat(Math.round(i/steps*22)),rest='░'.repeat(22-Math.round(i/steps*22));
    sessions[si].log=base+`${label} ${A(i===steps?32:33,fill)}${A(90,rest)} ${pct}%`;if(si===actSess)paintLog();await sleep(ms/steps)}
  sessions[si].log=base+`${label} ${A(32,'█'.repeat(22))} 100%\n`;save.term();if(si===actSess)paintLog()}
function openTerminal(){openPage($('pgTerminal'));renderTerminal();setTimeout(()=>$('termIn')&&$('termIn').focus(),350)}
function showSessPill(){const pl=$('tmPill');pl.innerHTML=tsvg('term','width:16px;height:16px')+` [${sessions[actSess].n}]`;pl.style.opacity=1;clearTimeout(showSessPill.t);showSessPill.t=setTimeout(()=>pl.style.opacity=0,1100)}
function saveLog(x){const txt=stripAnsi(x.log||'(empty)');const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));l.download=`echoo-terminal-session-${x.n}.txt`;l.click();toast('Log saved as text file')}
function renderTerminal(){
  $('tmTabs').innerHTML=sessions.map((x,i)=>`<span data-s="${i}" style="display:inline-flex;align-items:center;gap:2px;padding:2px 4px;border-radius:8px;${i===actSess?'background:#fff;':''}"><b style="font-weight:700;font-size:14px;color:#000">[${x.n}]</b><button data-dl="${i}" title="Download log" style="width:24px;height:24px;color:#000;display:grid;place-items:center">${tsvg('dl','width:15px;height:15px')}</button><button data-del="${i}" title="Delete session" style="width:24px;height:24px;color:#000;display:grid;place-items:center">${tsvg('del','width:14px;height:14px')}</button></span>`).join('');
  $('tmTabs').querySelectorAll('[data-s]').forEach(el=>el.onclick=e=>{if(e.target.closest('button'))return;const i=+el.dataset.s;if(i!==actSess){actSess=i;renderTerminal();showSessPill()}});
  $('tmTabs').querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>saveLog(sessions[+b.dataset.dl]));
  $('tmTabs').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const i=+b.dataset.del;openSheet(`<h4>Delete session [${sessions[i].n}]?</h4><p>The whole session and its log will be removed.</p><div class="sbtns"><button id="tNo">Cancel</button><button class="dang" id="tYes">Delete</button></div>`,s=>{s.querySelector('#tNo').onclick=closeSheet;s.querySelector('#tYes').onclick=()=>{sessions.splice(i,1);if(!sessions.length)sessions.push({n:1,log:TERM_WELCOME});actSess=Math.min(actSess,sessions.length-1);save.term();closeSheet();renderTerminal();toast('Session deleted')}})});
  $('termOut').innerHTML='<div id="tLog" style="white-space:pre-wrap;overflow-wrap:anywhere"></div><div style="display:flex;align-items:center"><span style="white-space:nowrap;color:#27c93f">~</span><span style="white-space:nowrap">&nbsp;$&nbsp;</span><input id="termIn" autocomplete="off" autocapitalize="off" spellcheck="false" style="flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font:inherit;padding:0"></div>';
  paintLog();$('termIn').addEventListener('keydown',termKey)}
async function termKey(e){if(e.key!=='Enter')return;const v=e.target.value;e.target.value='';const si=actSess;
  sessions[si].log+=A(32,'~')+' $ '+v+'\n';save.term();paintLog();await runShell(v,si)}
$('tmKb').onclick=()=>$('termIn').focus();
$('tmNew').onclick=()=>{const n=sessions.length+1;sessions.push({n,log:TERM_WELCOME});actSess=sessions.length-1;save.term();renderTerminal();showSessPill()};
document.querySelectorAll('#tmKeys [data-key]').forEach(b=>b.onclick=()=>{const k=b.dataset.key;const inp=$('termIn');if(!inp)return;if(k==='—')inp.value+='-';else if(k==='/')inp.value+='/';else if(k==='TAB')inp.value+='  ';inp.focus()});
async function runShell(cmd,si){const c=cmd.trim();if(!c)return;const [bin,...rest]=c.split(/\s+/),P=l=>termPrint(si,l);
  if(bin==='clear'){sessions[si].log='';paintLog();return}
  if(bin==='help')return P(['Commands: help, ls, pwd, whoami, date, clear, echo, df, color, yt-dlp <url>, pip install <pkg>, pkg install <pkg>']);
  if(bin==='ls')return P([A(34,'Downloads')+'  '+A(34,'Documents')+'  '+A(34,'scripts')+'  '+A(34,'projects')+'  '+A(34,'logs')+'  '+A(32,'run.sh')]);
  if(bin==='pwd')return P(['/data/data/com.termux/files/home']);
  if(bin==='whoami')return P(['u0_a221']);
  if(bin==='date')return P([new Date().toString()]);
  if(bin==='echo')return P([rest.join(' ')]);
  if(bin==='df')return P(['Filesystem      Size  Used Avail Use%','/data            64G   21G   43G  '+A(33,'33%')]);
  if(bin==='color')return P([[31,32,33,34,35,36].map(k=>A(k,'██ ')).join('')+A(1,'bold')]);
  if(bin==='pkg'||bin==='pip'){if(!rest.length)return P([A(31,'usage: '+bin+' install <package>')]);const name=rest.slice(1).join(' ')||rest[0];
    await P([A(36,'Reading package lists... Done'),A(36,'Resolving '+name+' ...')]);await termProgress(si,A(90,'Downloading ')+name,1600);await P([A(33,'Unpacking '+name+'...'),A(32,'✓ '+name+' installed (simulated, connect your engine for real installs)')]);return}
  if(bin==='yt-dlp'){if(!rest.length)return P([A(31,'Usage: yt-dlp <url>')]);await P([A(36,'[youtube] Extracting URL: '+rest[0]),A(90,'[info] Downloading video')]);await termProgress(si,A(33,'[download]'),2200);await P([A(32,'✓ Saved to Downloads/')]);return}
  return P([A(31,bin+': command not found')])}
/* ---------- Live agent: last item in the Agent folder ---------- */
function openLive(){openPage($('pgLive'));renderLive()}
function renderLive(){
  const r=tasks.find(t=>t.status==='running'),w=tasks.find(t=>t.status==='waiting'),focus=r||w;
  const last=focus?focus.logs.filter(l=>l.line.startsWith('$')).slice(-1)[0]:null;
  const repeats=focus?(()=>{const cmds=focus.logs.filter(l=>l.line.startsWith('$')).slice(-4).map(l=>l.line);return cmds.length===4&&cmds.every(c=>c===cmds[0])})():false;
  const lines=(focus?focus.logs:[]).slice(-40);
  $('liveBody').innerHTML=`
   <div class="card" style="padding:14px">
     <div style="display:flex;justify-content:space-between;align-items:center"><b>${focus?esc(focus.title):'Idle'}</b><span class="badge ${focus?'b-'+focus.status:''}">${focus?focus.status:'no task'}</span></div>
     <div class="muted" style="margin-top:6px;font-size:13px">${r?'Working in the background now.':(w?'Waiting for your permission.':'Nothing running. The agent is idle.')}</div>
     <div class="note" style="margin-top:10px"><b>Current command:</b><br><span style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${last?esc(last.line):'—'}</span></div>
     ${repeats?'<div class="note" style="background:#fff3dc;color:#7a4f00"><b>Possible loop:</b> the same command ran 4 times in a row. Force stop, then retry.</div>':''}
     <div style="display:flex;gap:8px;margin-top:8px"><button class="pill danger" id="lvStop">Force stop</button><button class="pill" id="lvRetry">Retry</button></div>
   </div>
   <div class="sec">Live terminal</div><div class="term" id="lvTerm" style="min-height:200px;max-height:300px">${lines.map(l=>`<div class="${l.cls}">[${l.ts}] ${esc(l.line)}</div>`).join('')||'<span style="color:#777">No output yet.</span>'}</div>
   <div class="sec">Tell the agent</div>
   <div style="display:flex;gap:8px"><input class="fld" id="lvIn" placeholder="e.g. stop this step and try another way" style="flex:1"><button class="pill" id="lvSend">Send</button></div>`;
  const tr=$('lvTerm');tr.scrollTop=tr.scrollHeight;
  $('lvStop').onclick=forceStopAll;
  $('lvRetry').onclick=()=>{const f=tasks.find(t=>t.status==='failed'||t.status==='paused');if(f){retryTask(f.id);}else toast('Nothing to retry')};
  const send=()=>{const v=$('lvIn').value.trim();if(!v)return;const f=focus;termLogAdd(`[${nowT()}] [you] ${v}\n`,0);if(f){f.logs.push({ts:nowT(),line:'User: '+v,cls:'usr'});save.tasks()}$('lvIn').value='';renderLive()};
  $('lvSend').onclick=send;$('lvIn').onkeydown=e=>{if(e.key==='Enter')send()}}

/* ---------- Tools: clean cards with real actions ---------- */
const TOOLS=[
 ['yt-dlp','Download videos and audio from YouTube and other sites','yt-dlp <url>',true],
 ['ffmpeg','Convert, trim and compress audio and video','ffmpeg -i in.mp4 out.mp3',true],
 ['python3','Run scripts and automation code','python3 run.py',true],
 ['tesseract','Read text from images and scanned PDFs (OCR)','tesseract scan.png out',false],
 ['chromium','Control a browser for web tasks','chromium --headless',true],
 ['pdftk','Merge, split and rotate PDF files','pdftk a.pdf b.pdf cat output all.pdf',false],
 ['requests','Python library: call web APIs and download files','pip show requests',true],
 ['pandas','Python library: clean and analyse tables and CSV data','pip show pandas',true],
 ['openpyxl','Python library: read and write Excel files','pip show openpyxl',true]
];
const toolState=LS.get('tools',{});
function openTools(){openPage($('pgTools'));renderTools()}
function renderTools(){
  const row=([n,d,ex,ok],i)=>{const inst=toolState[n]!==undefined?toolState[n]:ok;return `<div class="card" style="padding:12px 14px;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:8px"><b style="font-size:15px">${n}</b><span class="badge ${inst?'b-completed':'b-paused'}" style="margin-left:auto">${inst?'Installed':'Not installed'}</span></div>
    <div class="muted" style="font-size:13px;margin-top:4px;line-height:1.45">${d}</div>
    <div style="font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);margin-top:6px">$ ${esc(ex)}</div>
    <div style="display:flex;gap:6px;margin-top:10px"><button class="pill" data-run="${i}">Run in terminal</button><button class="pill" data-tog="${n}">${inst?'Remove':'Install'}</button></div></div>`};
  $('toolsBody').innerHTML=`<div class="sec">Tools</div>${TOOLS.map(row).join('')}<p class="hint">Installing or removing here changes the status only. Real installs run in the terminal after you approve.</p>`;
  $('toolsBody').querySelectorAll('[data-run]').forEach(b=>b.onclick=()=>{const t=TOOLS[+b.dataset.run];termLogAdd(`echoo@agent:~$ ${t[2]}\n`);openTerminal()});
  $('toolsBody').querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{const n=b.dataset.tog;const t=TOOLS.find(x=>x[0]===n);const cur=toolState[n]!==undefined?toolState[n]:t[3];toolState[n]=!cur;LS.set('tools',toolState);renderTools()})}

/* ---------- Permissions ---------- */
function openPerms(){openPage($('pgPerms'));renderPerms()}
function renderPerms(){const files=P.files;
  const reqs=tasks.flatMap(t=>t.perms.filter(p=>!p.granted).map(p=>({t,p})));
  $('permsBody').innerHTML=`
   <div class="sec">Access</div>
   <div class="card">
     <button class="row" id="pRoot">${svg('<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/>')}<div style="flex:1">Root service<div class="muted" style="font-size:12.5px">${P.root?'Active':'Not active. Needed for system-level tasks.'}</div></div><span class="sw ${P.root?'on':''}"></span></button>
     <button class="row" id="pAcc">${svg('<circle cx="12" cy="5" r="2"/><path d="M5 9h14M12 9v12M8 21l4-6 4 6"/>')}<div style="flex:1">Accessibility<div class="muted" style="font-size:12.5px">Needed for phone control</div></div><span class="sw ${P.acc?'on':''}"></span></button>
     <button class="row" id="pPhone">${svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>')}<div style="flex:1">Control my phone<div class="muted" style="font-size:12.5px">Agent reads the screen and taps for you</div></div><span class="sw ${P.phone?'on':''}"></span></button>
   </div>
   <div class="sec">File manager</div>
   <div class="card">${Object.keys(files).map(f=>`<button class="row" data-folder="${f}">${svg('folder')}<div style="flex:1">${f}<div class="muted" style="font-size:12.5px">${files[f]?'Agent can read and write':'Blocked'}</div></div><span class="sw ${files[f]?'on':''}"></span></button>`).join('')}</div>
   <div class="sec">Pending requests</div>
   ${reqs.length?reqs.map(({t,p})=>`<div class="note"><b>${esc(p.text)}</b><div class="muted" style="margin-top:2px">${esc(t.title)}</div><div style="margin-top:6px">${esc(p.solution)}</div><button class="pill" style="margin-top:8px" data-grant="${t.id}|${p.id}">Grant</button></div>`).join(''):'<div class="hint">No pending requests.</div>'}`;
  $('pRoot').onclick=()=>{P.root=!P.root;saveP();renderPerms()};
  $('pAcc').onclick=()=>{P.acc=!P.acc;saveP();renderPerms()};
  $('pPhone').onclick=phoneToggle;
  $('permsBody').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>{files[b.dataset.folder]=!files[b.dataset.folder];saveP();renderPerms()});
  $('permsBody').querySelectorAll('[data-grant]').forEach(b=>b.onclick=()=>{const[a,c]=b.dataset.grant.split('|');grantPerm(a,c)})}
function phoneToggle(){
  if(P.phone){P.phone=false;saveP();renderPerms();renderSettings($('setQ').value||'');toast('Phone control off');return}
  openSheet(`<h4>Let the agent control your phone?</h4><p>The agent will read your screen and tap, type and scroll for you, including in the background. You can turn this off any time.</p><div class="sbtns"><button id="phNo">Cancel</button><button id="phYes" style="background:#111;color:#fff">Turn on</button></div>`,s=>{
    s.querySelector('#phNo').onclick=closeSheet;s.querySelector('#phYes').onclick=()=>{P.phone=true;saveP();closeSheet();renderPerms();toast('Phone control on')}})}

/* ---------- Settings ---------- */
const ROW={
 profile:['Profile','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',()=>P.full],
 color:['Color mode','<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',()=>({system:'System',light:'Light',dark:'Dark'})[P.theme]],
 font:['Font style','<path d="M5 19 12 5l7 14M8 14h8"/>',()=>P.font==='system'?'System':'Default'],
 phone:['Control my phone','<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',()=>P.phone?'On':'Off'],
 notif:['Notifications','<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',()=>P.notif?'On':'Off'],
 storage:['Storage','<rect x="3" y="7" width="18" height="10" rx="3"/><path d="M7 12h5"/>',()=>''],
 email:['Email','<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',()=>P.email],
 age:['Age','<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',()=>P.age?P.age+' years':''],
 privacy:['Privacy policy','<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',()=>''],
 about:['About Echoo','<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',()=>''],
 logout:['Log out','<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>',()=>'']};
function renderSettings(q=''){q=q.toLowerCase();const R=k=>`<button class="row ${k==='logout'?'red':''}" data-k="${k}"><svg viewBox="0 0 24 24">${ROW[k][1]}</svg>${ROW[k][0]}<small>${esc(ROW[k][2]())}</small></button>`;
  const f=ks=>ks.filter(k=>!q||ROW[k][0].toLowerCase().includes(q));
  const a=f(['profile','color','font','phone','notif','storage','email','age','privacy','about']),b=f(['logout']);
  $('setBody').innerHTML=(a.length?`<div class="card">${a.map(R).join('')}</div>`:'')+(b.length?`<div class="card">${b.map(R).join('')}</div>`:'')+(a.length+b.length?'':'<div class="empty">Nothing found</div>');
  $('setBody').querySelectorAll('.row').forEach(el=>el.onclick=()=>{if(el.dataset.k==='phone'){phoneToggle();return}openSub(el.dataset.k)})}
const OPT=(items,cur)=>`<div class="card">${items.map(([v,l])=>`<button class="row ${v===cur?'sel':''}" data-v="${v}">${l}${svg('ok','class="ck"')}</button>`).join('')}</div>`;
function optBind(f){$('subB').querySelectorAll('.row').forEach(el=>el.onclick=()=>{$('subB').querySelectorAll('.row').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');f(el.dataset.v)})}
function openSub(k){const b=$('subB');$('subT').textContent=ROW[k][0];
  if(k==='profile'){b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin:10px 0"><div class="avatar" style="width:84px;height:84px;font-size:32px"></div><button class="pill" id="pEdit">Change photo</button><input hidden type="file" id="pFile" accept="image/*"></div><div class="lbl">Full name</div><input class="fld" id="pFull" maxlength="40"><div class="lbl">What should we call you?</div><input class="fld" id="pNick" maxlength="30"><button class="bigbtn" id="pSave">Update profile</button>`;
    $('pFull').value=P.full;$('pNick').value=P.nick;paintProfile();
    $('pEdit').onclick=()=>$('pFile').click();
    $('pFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=Math.min(im.width,im.height);c.width=c.height=240;c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,240,240);P.avatar=c.toDataURL('image/jpeg',.85);saveP();paintProfile();openSub('profile')};im.src=r.result};r.readAsDataURL(f)};
    $('pSave').onclick=()=>{P.full=$('pFull').value.trim()||'razpreet wander';P.nick=$('pNick').value.trim()||P.full.split(' ')[0];saveP();paintProfile();toast('Profile updated. I\'ll call you '+userName());closePage()}}
  else if(k==='color'){b.innerHTML=OPT([['system','System'],['light','Light'],['dark','Dark']],P.theme);optBind(v=>{P.theme=v;saveP();applyLook()})}
  else if(k==='font'){b.innerHTML=OPT([['default','Default'],['system','System font']],P.font);optBind(v=>{P.font=v;saveP()})}
  else if(k==='notif'){const hint=()=>{$('nHint').textContent=!('Notification'in window)?'This browser does not support notifications.':Notification.permission==='denied'?'Permission is blocked. Allow notifications in your browser site settings.':'Get notified when replies and reminders are ready.'};
    b.innerHTML=`<div class="card"><button class="row" id="nRow">${svg(ROW.notif[1])}Notifications<span class="sw ${P.notif?'on':''}" id="nSw"></span></button></div><p class="hint" id="nHint"></p>`;hint();
    $('nRow').onclick=async()=>{if(P.notif){P.notif=false}else if('Notification'in window){const r=await Notification.requestPermission();P.notif=r==='granted'}else toast('Notifications are not supported');saveP();$('nSw').classList.toggle('on',P.notif);hint()}}
  else if(k==='storage'){b.innerHTML=`<div class="card" style="padding:16px"><div id="stTxt">Calculating…</div></div><button class="bigbtn ghost" id="stAllow">Allow persistent storage</button><button class="bigbtn soft" id="stClr">Delete all chats</button><p class="hint" id="stHint"></p>`;
    (async()=>{try{const e=await navigator.storage.estimate(),p=await navigator.storage.persisted();$('stTxt').textContent=(e.usage/1048576).toFixed(1)+' MB used of '+Math.round(e.quota/1048576)+' MB';$('stHint').textContent=p?'Persistent storage is allowed.':'Not allowed. The browser may clear data when it needs space.'}catch(e){$('stTxt').textContent='Storage info is not available.'}})();
    $('stAllow').onclick=async()=>{try{const ok=await navigator.storage.persist();toast(ok?'Storage permission granted':'Browser did not grant permission')}catch(e){toast('Not supported in this browser')}};
    $('stClr').onclick=()=>openSheet(`<h4>Delete all chats?</h4><p>Chats will be removed from this device. Tasks and automations stay.</p><div class="sbtns"><button id="cNo">Cancel</button><button class="dang" id="cYes">Delete</button></div>`,s=>{s.querySelector('#cNo').onclick=closeSheet;s.querySelector('#cYes').onclick=()=>{chats=[];cur=null;save.chats();renderHistory();closeSheet();toast('All chats deleted')}})}
  else if(k==='email'){b.innerHTML=`<div class="lbl">Your email</div><input class="fld" id="eIn" type="email" inputmode="email" placeholder="name@gmail.com"><button class="bigbtn" id="eSave">Save</button>`;$('eIn').value=P.email;$('eSave').onclick=()=>{const v=$('eIn').value.trim();if(v&&!/^\S+@\S+\.\S+$/.test(v))return toast('Enter a valid email');P.email=v;saveP();toast('Email saved');closePage()}}
  else if(k==='age'){b.innerHTML=`<div class="lbl">How old are you?</div><select class="fld" id="aIn"><option value="">Choose</option>${Array.from({length:96},(_,i)=>`<option ${P.age==i+5?'selected':''}>${i+5}</option>`).join('')}</select>`;$('aIn').onchange=e=>{P.age=e.target.value;saveP();toast('Age saved')}}
  else if(k==='privacy'){b.innerHTML=`<div class="card" style="padding:6px 16px 14px"><p class="hint"><b>Your data, your control.</b> Chats, profile and settings stay in this device's browser storage.</p><p class="hint">The microphone is on only while you use voice or live conversation.</p><p class="hint">Incognito chats are not saved. You can delete all chats from Storage at any time.</p></div>`}
  else if(k==='about'){b.innerHTML=`<div class="card" style="padding:20px;text-align:center"><img src="${document.querySelector('.logo img').src}" style="width:70px;height:70px;object-fit:contain"><h2 style="margin:8px 0 2px">Echoo</h2><p class="muted" style="margin:0">Version 2.0</p><p class="hint">Your AI agent for live conversation and getting real work done.</p></div>`}
  else if(k==='logout'){openSheet(`<h4>Log out?</h4><p>Your profile and saved chats will be removed from this device.</p><div class="sbtns"><button id="lgNo">Cancel</button><button class="dang" id="lgYes">Log out</button></div>`,s=>{s.querySelector('#lgNo').onclick=closeSheet;s.querySelector('#lgYes').onclick=()=>{closeSheet();try{Object.keys(localStorage).filter(x=>x.startsWith('echoo.')).forEach(x=>localStorage.removeItem(x))}catch(e){}location.reload()}});return}
  openPage($('pgSub'))}
$('settings').onclick=()=>{closeAllPagesTo(0);$('setQ').value='';renderSettings();openPage($('pgSettings'))};
$('setQ').oninput=e=>renderSettings(e.target.value);
$('profOpen').onclick=()=>{closeAllPagesTo(0);openSub('profile')};

/* ---------- init ---------- */
applyLook();paintProfile();renderHistory();showHome();syncSend();renderComposerTop();
tasks.forEach(t=>{if(t.status==='running'){t.status='paused';logT(t,'⏸ Paused (app was reloaded)')}});save.tasks();
if(ghost)$('ghostBtn').classList.add('on');


/* ---------- Android Native Back Button & Popstate Navigation ---------- */
window.addEventListener('popstate', (e)=>{
  // 1. If bottom sheet is open, close sheet
  const sheetBg = document.getElementById('sheetBg');
  if(sheetBg && sheetBg.classList.contains('show')){
    closeSheet();
    return;
  }
  // 2. If mobile sidebar is open, close sidebar
  const sidebar = document.getElementById('sidebar');
  if(sidebar && !sidebar.classList.contains('closed') && window.innerWidth <= 768){
    setSide(true);
    return;
  }
  // 3. If a full page is open, close page
  if(pages && pages.length > 0){
    closePage();
  }
});

/* ---------- Offline Service Worker Registration ---------- */
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      console.log('Echoo ServiceWorker active', reg.scope);
    }).catch(err=>{
      console.warn('Echoo ServiceWorker registration failed', err);
    });
  });
}

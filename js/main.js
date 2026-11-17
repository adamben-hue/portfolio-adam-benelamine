import {DATA} from './data.js';import {Viewer} from './viewer.js';
const $=s=>document.querySelector(s),pad=i=>String(i+1).padStart(2,'0'),BG=['#20262B','#252d33','#1d2328'];
function galerie(root,items){
 const q=s=>root.querySelector(s),n=items.length,pv=new Viewer(q('.vue')),liste=q('.liste'),ex=q('.ex');let cur=-1;root.style.height=(n*130+100)+'vh';
 const txt=i=>{q('.num').textContent=pad(i)+' / '+pad(n-1);q('.nom-p').textContent=items[i].nom;q('.stage').style.background=BG[i%3]};
 const mark=k=>[...liste.children].forEach((li,j)=>li.classList.toggle('on',j===k));pv.onpick=mark;
 function ui(i,names){q('.meta').textContent=`Assemblage · ${names.length} composants · ${items[i].f.split('/').pop()}`;liste.innerHTML='';
  names.forEach((nm,k)=>{const li=document.createElement('li');li.innerHTML=`<button class="n">${nm}</button><button class="ic" title="Masquer / afficher">◉</button><button class="ic" title="Isoler">◎</button>`;
   const [a,b,c]=li.children;a.onclick=()=>{pv.select(pv.sel===k?-1:k);mark(pv.sel)};
   b.onclick=()=>{const v=!pv.parts[k].g.visible;pv.show1(k,v);b.style.opacity=v?1:.35};c.onclick=()=>{pv.isolate(k);liste.querySelectorAll('.ic:nth-child(2)').forEach((x,j)=>x.style.opacity=j===k?1:.35)};liste.append(li)})}
 async function load(i){cur=i;txt(i);q('.meta').textContent='';liste.innerHTML='';const names=await pv.show(items[i].f);if(cur!==i)return;if(!names){q('.meta').textContent='Modèle indisponible';return}ui(i,names)}
 q('.reset').onclick=()=>{pv.reset();ex.value=0;mark(-1);liste.querySelectorAll('.ic').forEach(x=>x.style.opacity=1)};
 const range=()=>root.offsetHeight-innerHeight,go=i=>scrollTo({top:root.offsetTop+(Math.max(0,Math.min(n-1,i))+.05)/n*range(),behavior:'smooth'});
 function sc(){const p=Math.max(0,Math.min(1,(scrollY-root.offsetTop)/range())),i=Math.min(n-1,Math.floor(p*n)),t=p*n-i,near=scrollY+innerHeight>root.offsetTop+8;
  if(i!==cur){if(near){const nm=pv.commit(items[i].f);if(nm){cur=i;txt(i);ui(i,nm)}else load(i)}}
  else{if(i<n-1&&t>.25)pv.prepare(items[i+1].f);const u=i<n-1?Math.max(0,Math.min(1,(t-.78)/.22)):0;pv.handover(u);txt(u>.5?i+1:i);
   const k=Math.max(0,Math.min(1,(t-.2)/.5));if(!(pv.sel>=0)){ex.value=k;pv.eclate(k)}}
  q('.progi').style.width=p*100+'%'}
 ex.oninput=()=>pv.eclate(+ex.value);q('.pp').onclick=()=>go(cur-1);q('.pn').onclick=()=>go(cur+1);addEventListener('scroll',sc,{passive:true});addEventListener('resize',sc);sc()}
galerie($('#g-projets'),DATA.projets.filter(p=>p.g==='projets'));galerie($('#g-perso'),DATA.projets.filter(p=>p.g==='perso'));
const mv=new Viewer($('#vue-m')),gr=$('#grille'),fi=$('#filtres'),cats=['Toutes',...new Set(DATA.pieces.map(p=>p.cat))];
function ouvre(p){$('#mt').textContent=p.nom;$('#mm').textContent=p.cat+' · '+p.f.split('/').pop();$('#modale').classList.add('ouverte');mv.clear();mv.show(p.f)}
function rend(c){gr.innerHTML='';DATA.pieces.forEach((p,i)=>{if(c!=='Toutes'&&p.cat!==c)return;const b=document.createElement('button');b.className='carte';
 b.innerHTML=`<span class="mono">${pad(i)}</span><b>${p.nom}</b><small class="mono">${p.cat}</small>`;b.onclick=()=>ouvre(p);gr.append(b)})}
cats.forEach((c,i)=>{const b=document.createElement('button');b.className='mono'+(i?'':' on');b.textContent=c;b.onclick=()=>{fi.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');rend(c)};fi.append(b)});rend('Toutes');
['Semelle','Support','Cale Pentée','Butée','Vis de Manœuvre','Plaque d’Arrêt'].forEach((nm,k)=>{const p=DATA.pieces.find(p=>p.nom===nm);if(!p)return;const li=document.createElement('li'),b=document.createElement('button');b.className='mono';b.title='Voir '+p.nom+' en 3D';b.innerHTML='<span class="o">'+(k+1)+'</span> '+p.nom;b.onclick=()=>ouvre(p);li.append(b);$('#chips').append(li)});
const cl=()=>$('#modale').classList.remove('ouverte');$('#mf').onclick=cl;$('#modale').onclick=e=>{if(e.target.id==='modale')cl()};
const lb=pl=>{$('#lb-img').src=pl.img;$('#lb-img').alt='Mise en plan : '+pl.nom;$('#lb-pdf').href=pl.pdf;$('#lightbox').classList.add('ouverte')};
DATA.plans.filter(pl=>pl.nom!=='Butée Réglable').forEach(pl=>{const b=document.createElement('button');b.className='plan';b.innerHTML=`<img src="${pl.img}" loading="lazy" alt="Mise en plan : ${pl.nom}"><b>${pl.nom}</b><span class="mono">Mise en plan</span>`;b.onclick=()=>lb(pl);$('#lesplans').append(b)});
$('.plan-img').onclick=()=>lb(DATA.plans.find(p=>p.nom==='Butée Réglable'));$('#lb-f').onclick=()=>$('#lightbox').classList.remove('ouverte');
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.15});document.querySelectorAll('.rv').forEach(x=>io.observe(x));

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const CDN='https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/';let occt;const GR=[0xd8dadd,0xb9bdc2,0x9aa0a6,0xc9ccd0],CACHE=new Map(),ez=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
export class Viewer{
 constructor(el,o={}){this.el=el;this.msg=el.querySelector('.msg');this.on=true;this.tk=0;this.parts=[];this.g=null;this.m=null;this.nx=null;this.nk=null;this.an=null;this.ray=new THREE.Raycaster();this.onpick=null;
  this.r=new THREE.WebGLRenderer({antialias:true,alpha:true});this.r.setPixelRatio(Math.min(devicePixelRatio,2));el.prepend(this.r.domElement);
  this.s=new THREE.Scene();this.c=new THREE.PerspectiveCamera(38,1,.1,1e5);
  this.s.add(new THREE.HemisphereLight(0xffffff,0x20262b,1.5));const d=new THREE.DirectionalLight(0xffffff,2);d.position.set(1,2,1.5);this.s.add(d);
  this.o=new OrbitControls(this.c,this.r.domElement);this.o.enableDamping=true;this.o.autoRotate=!!o.rotate;this.o.autoRotateSpeed=.8;this.o.enableZoom=false;
  const cv=this.r.domElement;cv.style.touchAction='pan-y';cv.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();this.zoom(e.deltaY>0?1.1:.9)}},{passive:false});
  const z=document.createElement('div');z.className='zoom';z.innerHTML='<button aria-label="Zoomer" title="Zoomer (Ctrl + molette)">+</button><button aria-label="Dézoomer" title="Dézoomer">−</button>';z.children[0].onclick=()=>this.zoom(.8);z.children[1].onclick=()=>this.zoom(1.25);el.append(z);
  cv.addEventListener('pointerdown',e=>{this.p0=[e.clientX,e.clientY]});
  cv.addEventListener('pointerup',e=>{if(!this.g||!this.p0||Math.hypot(e.clientX-this.p0[0],e.clientY-this.p0[1])>4)return;const b=cv.getBoundingClientRect();
   this.ray.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),this.c);
   const h=this.ray.intersectObjects(this.g.children,true).find(x=>x.object.parent.visible);const i=h?h.object.userData.i:-1;this.select(i);this.onpick&&this.onpick(i)});
  new ResizeObserver(()=>this.size()).observe(el);new IntersectionObserver(([e])=>{this.on=e.isIntersecting}).observe(el);this.size();
  this.r.setAnimationLoop(()=>{if(this.on){this.tick();this.o.update();this.r.render(this.s,this.c)}})}
 size(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.r.setSize(w,h,false);this.c.aspect=w/h;this.c.updateProjectionMatrix()}
 say(t){if(this.msg){this.msg.textContent=t;this.msg.style.display=t?'grid':'none'}}
 data(path){if(!CACHE.has(path))CACHE.set(path,(async()=>{occt??=await occtimportjs({locateFile:n=>CDN+n});
   const r=occt.ReadStepFile(new Uint8Array(await (await fetch(encodeURI(path))).arrayBuffer()),null);if(!r.success)throw 0;return r})().catch(e=>{CACHE.delete(path);throw e}));return CACHE.get(path)}
 build(res){const M=res.meshes.map((m,i)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(m.attributes.position.array,3));
   m.attributes.normal?geo.setAttribute('normal',new THREE.Float32BufferAttribute(m.attributes.normal.array,3)):geo.computeVertexNormals();geo.setIndex(m.index.array);
   return new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:m.color?new THREE.Color(...m.color):GR[i%4],roughness:.55,metalness:.25,side:THREE.DoubleSide}))});
  const take=(n,o)=>{(n.meshes||[]).forEach(i=>o.push(M[i]));(n.children||[]).forEach(c=>take(c,o));return o};
  let n=res.root;while((n.children||[]).length===1&&!(n.meshes||[]).length)n=n.children[0];
  const gr=[...(n.children||[]).map(c=>[take(c,[]),c.name]),...(n.meshes||[]).map(i=>[[M[i]],M[i].name])].filter(a=>a[0].length),inner=new THREE.Group();
  const parts=gr.map(([a,nm],i)=>{const p=new THREE.Group();a.forEach(m=>{m.userData.i=i;p.add(m)});inner.add(p);return {g:p,name:nm||'Composant '+String(i+1).padStart(2,'0')}});
  const box=new THREE.Box3().setFromObject(inner),ctr=box.getCenter(new THREE.Vector3()),dim=box.getSize(new THREE.Vector3()).length();
  parts.forEach(o=>{o.d=new THREE.Box3().setFromObject(o.g).getCenter(new THREE.Vector3()).sub(ctr)});inner.position.sub(ctr);const g=new THREE.Group();g.add(inner);return {g,parts,dim}}
 pose(m,s){m.g.position.y=s*m.dim*.8;const o=1-Math.abs(s),tr=o<.999;m.g.visible=o>.001;m.g.traverse(x=>{if(x.isMesh){const t=x.material;if(t.transparent!==tr){t.transparent=tr;t.needsUpdate=true}t.opacity=o;t.depthWrite=!tr||o>.5}})}
 drop(m){this.s.remove(m.g);m.g.traverse(x=>{if(x.isMesh){x.geometry.dispose();x.material.dispose()}})}
 adopt(m){this.m=m;this.g=m.g;this.parts=m.parts;this.dim=m.dim;this.sel=-1;this.c.near=m.dim/1000;this.c.far=m.dim*50;this.c.updateProjectionMatrix()}
 cam(m,mv,old){this.an={o:old,n:m,t0:performance.now(),d:900,mv,d0:this.c.position.length(),d1:m.dim*1.4787}}
 tick(){const a=this.an;if(!a)return;const u=Math.min(1,(performance.now()-a.t0)/a.d),e=ez(u);
  if(a.mv){if(a.o)this.pose(a.o,e);this.pose(a.n,e-1)}this.c.position.setLength(a.d0+(a.d1-a.d0)*e);if(u>=1){if(a.o)this.drop(a.o);this.an=null}}
 async show(path){const tk=++this.tk;this.el.classList.add('charge');this.say('');
  try{const res=await this.data(path);if(tk!==this.tk)return null;let m;
   if(this.nk===path&&this.nx){m=this.nx;this.nx=null;this.nk=null}else{m=this.build(res);this.s.add(m.g)}
   if(this.an){if(this.an.o)this.drop(this.an.o);this.an=null}const old=this.m;this.adopt(m);
   if(!old)this.c.position.set(1,.65,1).multiplyScalar(m.dim*.95);this.o.target.set(0,0,0);this.cam(m,true,old);this.pose(m,-1);
   this.el.classList.remove('charge');this.el.classList.add('pret');return m.parts.map(p=>p.name)
  }catch(e){if(tk===this.tk){this.el.classList.remove('charge');this.say('Ce modèle ne peut pas être chargé. Actualise la page ou vérifie ta connexion.')}return null}}
 async prepare(path){if(this.nk===path)return;this.nk=path;try{const res=await this.data(path);if(this.nk!==path)return;const m=this.build(res);this.pose(m,-1);this.s.add(m.g);if(this.nx)this.drop(this.nx);this.nx=m}catch(e){this.nk=null}}
 handover(u){const m=this.nx,c=this.m;if(!m||!c||this.an)return;this.pose(c,u);this.pose(m,u-1)}
 commit(path){if(!(this.nk===path&&this.nx))return null;const old=this.m,m=this.nx;this.nx=null;this.nk=null;if(old)this.drop(old);this.adopt(m);this.pose(m,0);this.cam(m,false,null);return m.parts.map(p=>p.name)}
 clear(){if(this.an){if(this.an.o)this.drop(this.an.o);this.an=null}if(this.m){this.drop(this.m);this.m=null}if(this.nx){this.drop(this.nx);this.nx=null}this.nk=null;this.g=null;this.parts=[];this.el.classList.remove('pret')}
 fit(){if(!this.m)return;this.c.position.set(1,.65,1).multiplyScalar(this.m.dim*.95);this.o.target.set(0,0,0);this.o.update()}
 zoom(f){const v=this.c.position.clone().multiplyScalar(f),l=v.length();if(!this.dim||l<this.dim*.15||l>this.dim*5)return;this.c.position.copy(v)}
 eclate(k){this.parts.forEach(o=>o.g.position.copy(o.d).multiplyScalar(k*1.2))}
 select(i){this.sel=i;this.parts.forEach((o,k)=>o.g.children.forEach(m=>m.material.emissive.setHex(k===i?0xe8753d:0).multiplyScalar(k===i?.45:0)))}
 show1(i,v){this.parts[i].g.visible=v}
 isolate(i){this.parts.forEach((o,k)=>o.g.visible=k===i)}
 reset(){this.parts.forEach(o=>o.g.visible=true);this.select(-1);this.eclate(0);this.fit()}
}

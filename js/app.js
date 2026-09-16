const $=s=>document.querySelector(s);
let people=[],bands=[],memberships=[],year=1994,selected=null;
const svg=$('#graph'), NS='http://www.w3.org/2000/svg';

async function load(){
  [people,bands,memberships]=await Promise.all([
    fetch('data/people.json').then(r=>r.json()),
    fetch('data/bands.json').then(r=>r.json()),
    fetch('data/memberships.json').then(r=>r.json())
  ]);
  render();
}
function el(tag,attrs={},text=''){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e}
function active(){return memberships.filter(m=>m.from<=year && m.to>=year)}
function render(){
  $('#yearValue').textContent=year;
  const ms=active();
  $('#stats').textContent=`${people.length} personas · ${bands.length} bandas · ${ms.length} relaciones`;
  svg.innerHTML='';
  const nodes=[
    ...people.filter(p=>ms.some(m=>m.person===p.id)).map((p,i)=>({...p,type:'person',x:150+(i%4)*185,y:80+Math.floor(i/4)*145})),
    ...bands.filter(b=>ms.some(m=>m.band===b.id)).map((b,i)=>({...b,type:'band',x:130+(i%3)*310,y:520-(i%2)*160}))
  ];
  const byId=new Map(nodes.map(n=>[n.id,n]));
  ms.forEach(m=>{
    const a=byId.get(m.person),b=byId.get(m.band);if(!a||!b)return;
    const line=el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'edge'});svg.append(line);
  });
  nodes.forEach(n=>{
    const g=el('g',{class:`node ${n.type}-node ${selected===n.id?'selected':''}`});
    const c=el('circle',{cx:n.x,cy:n.y,r:n.type==='band'?25:18});
    g.append(c,el('text',{x:n.x,y:n.y+(n.type==='band'?48:38),'text-anchor':'middle'},n.name));
    g.addEventListener('click',()=>select(n));
    svg.append(g);
  });
  renderResults();
}
function select(n){
  selected=n.id;
  const ms=active().filter(m=>m.person===n.id||m.band===n.id);
  let html=`<strong>${n.name}</strong><br>${n.type==='person'?'Bandas activas en '+year:'Miembros activos en '+year}<br><br>`;
  ms.forEach(m=>{
    const other=n.type==='person'?bands.find(b=>b.id===m.band):people.find(p=>p.id===m.person);
    html+=`• ${other?.name||''}${m.role?` — ${m.role}`:''}<br>`;
  });
  $('#details').innerHTML=html;
  render();
}
function renderResults(){
  const q=$('#search').value.trim().toLowerCase();
  if(!q){$('#results').innerHTML='<div class="result band">Pulsa un nodo del grafo.</div>';return}
  const all=[...people.map(x=>({...x,type:'person'})),...bands.map(x=>({...x,type:'band'}))]
    .filter(x=>x.name.toLowerCase().includes(q));
  $('#results').innerHTML=all.slice(0,20).map(x=>`<div class="result ${x.type}" data-id="${x.id}">${x.name}</div>`).join('');
  $('#results').querySelectorAll('.result').forEach(e=>e.addEventListener('click',()=>{
    const x=all.find(a=>a.id===e.dataset.id);if(x)select(x);
  }));
}
$('#year').addEventListener('input',e=>{year=Number(e.target.value);selected=null;render()});
$('#search').addEventListener('input',renderResults);
$('#reset').addEventListener('click',()=>{$('#search').value='';year=1994;$('#year').value=year;selected=null;render()});
load().catch(err=>{$('#details').textContent='No se pudieron cargar los datos: '+err});

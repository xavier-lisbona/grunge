const $ = s => document.querySelector(s);
let people = [], bands = [], cities = [], memberships = [];
let selected = null;
const svg = $('#graph'), NS = 'http://www.w3.org/2000/svg';

async function load() {
  [people, bands, cities, memberships] = await Promise.all([
    fetch('data/people.json').then(r => r.json()),
    fetch('data/bands.json').then(r => r.json()),
    fetch('data/cities.json').then(r => r.json()),
    fetch('data/memberships.json').then(r => r.json())
  ]);
  render();
}
function el(tag, attrs = {}, text = '') {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}
function active() { return memberships; }
function get(type, id) { return ({ city: cities, band: bands, person: people }[type] || []).find(x => x.id === id); }
function key(type, id) { return type + ':' + id; }
function cityRadius(id) { return 22 + Math.min(30, bands.filter(b => b.city === id).length * 3); }
function mostConnectedPerson() {
  return people.reduce((leader, person) => {
    const connections = memberships.filter(m => m.person === person.id).length;
    return !leader || connections > leader.connections ? { ...person, connections } : leader;
  }, null);
}

function context() {
  const ms = active();
  if (!selected) return { nodes: cities.map(c => ({ ...c, type: 'city' })), edges: [] };

  if (selected.type === 'city') {
    const cityBands = bands.filter(b => b.city === selected.id && ms.some(m => m.band === b.id));
    return {
      nodes: [{ ...get('city', selected.id), type: 'city' }, ...cityBands.map(b => ({ ...b, type: 'band' }))],
      edges: cityBands.map(b => ({ from: key('city', selected.id), to: key('band', b.id) }))
    };
  }
  if (selected.type === 'band') {
    const bandMembers = ms.filter(m => m.band === selected.id);
    const band = get('band', selected.id);
    return {
      nodes: [{ ...get('city', band.city), type: 'city' }, { ...band, type: 'band' },
        ...bandMembers.map(m => ({ ...get('person', m.person), type: 'person', membershipStatus: m.status }))],
      edges: [{ from: key('city', band.city), to: key('band', band.id) },
        ...bandMembers.map(m => ({ from: key('band', selected.id), to: key('person', m.person) }))]
    };
  }

  const personBands = memberships.filter(m => m.person === selected.id).map(m => get('band', m.band));
  const personCities = [...new Set(personBands.map(b => b.city))].map(id => get('city', id));
  return {
    nodes: [...personCities.map(c => ({ ...c, type: 'city' })), ...personBands.map(b => ({ ...b, type: 'band' })),
      { ...get('person', selected.id), type: 'person' }],
    edges: [...personCities.flatMap(c => personBands.filter(b => b.city === c.id)
      .map(b => ({ from: key('city', c.id), to: key('band', b.id) }))),
      ...personBands.map(b => ({ from: key('person', selected.id), to: key('band', b.id) }))]
  };
}

function render() {
  const ms = active();
  $('#stats').textContent = cities.length + ' cities · ' + people.length + ' people · ' + bands.length + ' bands · ' + ms.length + ' relationships';
  const leader = mostConnectedPerson();
  $('#tip').textContent = leader ? 'Tip: ' + leader.name + ' has the most connections (' + leader.connections + ' bands).' : '';
  svg.innerHTML = '';
  const view = context();
  const groups = {
    city: view.nodes.filter(n => n.type === 'city'),
    band: view.nodes.filter(n => n.type === 'band'),
    person: view.nodes.filter(n => n.type === 'person')
  };
  const bandRows = Math.ceil(groups.band.length / 4);
  const personStart = groups.band.length ? 200 + bandRows * 130 : 210;
  const graphHeight = Math.max(600,
    120 + groups.city.length * 120,
    200 + bandRows * 130,
    personStart + Math.ceil(groups.person.length / 6) * 70 + 50);
  svg.setAttribute('viewBox', '0 0 900 ' + graphHeight);
  svg.style.minHeight = graphHeight + 'px';
  const positions = new Map();
  groups.city.forEach((n, i) => positions.set(key('city', n.id), { x: 450, y: 90 + i * 120 }));
  groups.band.forEach((n, i) => positions.set(key('band', n.id), { x: 170 + (i % 4) * 200, y: 200 + Math.floor(i / 4) * 130 }));
  groups.person.forEach((n, i) => positions.set(key('person', n.id), { x: 110 + (i % 6) * 140, y: personStart + Math.floor(i / 6) * 70 }));

  view.edges.forEach(edge => {
    const a = positions.get(edge.from), b = positions.get(edge.to);
    if (a && b) svg.append(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'edge' }));
  });
  view.nodes.forEach(n => {
    const p = positions.get(key(n.type, n.id));
    const g = el('g', { class: 'node ' + n.type + '-node ' + (n.membershipStatus === 'former' ? 'former-member ' : '') +
      (selected && selected.type === n.type && selected.id === n.id ? 'selected' : '') });
    const radius = n.type === 'city' ? cityRadius(n.id) : n.type === 'band' ? 25 : 18;
    g.append(el('circle', { cx: p.x, cy: p.y, r: radius }));
    const labelY = p.y + (n.type === 'city' ? radius + 20 : n.type === 'band' ? 46 : 37);
    g.append(el('text', { x: p.x, y: labelY, 'text-anchor': 'middle' }, n.name));
    if (n.type === 'band') g.append(el('text', { x: p.x, y: labelY + 17, 'text-anchor': 'middle', class: 'band-years' }, n.from + ' - ' + (n.to || 'Present')));
    g.addEventListener('click', () => select(n));
    svg.append(g);
  });
  renderResults();
}

function select(node) { selected = { type: node.type, id: node.id }; renderDetails(node); render(); }
function renderDetails(node) {
  const ms = active();
  let html = '<strong>' + node.name + '</strong><br>';
  if (node.type === 'city') {
    const cityBands = bands.filter(b => b.city === node.id && ms.some(m => m.band === b.id));
    html += 'Bands from this city<br><br>' + (cityBands.map(b => '• ' + b.name).join('<br>') || 'No bands recorded.');
  } else if (node.type === 'band') {
    const members = ms.filter(m => m.band === node.id);
    html += 'Band members<br><br>' + members.map(m => '<span class="member ' + (m.status === 'former' ? 'former-member' : '') + '">• ' + (get('person', m.person)?.name || '') + (m.role ? ' — ' + m.role : '') + (m.status === 'former' ? ' (former member)' : '') + '</span>').join('<br>');
  } else {
    const personMemberships = memberships.filter(m => m.person === node.id);
    html += 'Bands they played in' + '<br><br>' + personMemberships.map(m => '• ' + (get('band', m.band)?.name || '') + (m.role ? ' — ' + m.role : '')).join('<br>');
  }
  $('#details').innerHTML = html;
}
function renderResults() {
  const q = $('#search').value.trim().toLowerCase();
  if (!q) { $('#results').innerHTML = '<div class="result hint">Select a city to begin.</div>'; return; }
  const all = [...cities.map(x => ({ ...x, type: 'city' })), ...people.map(x => ({ ...x, type: 'person' })),
    ...bands.map(x => ({ ...x, type: 'band' }))].filter(x => x.name.toLowerCase().includes(q));
  $('#results').innerHTML = all.slice(0, 20).map(x => '<div class="result ' + x.type + '" data-type="' + x.type + '" data-id="' + x.id + '">' + x.name + '</div>').join('');
  $('#results').querySelectorAll('.result').forEach(e => e.addEventListener('click', () => select(get(e.dataset.type, e.dataset.id))));
}
$('#search').addEventListener('input', renderResults);
$('#reset').addEventListener('click', () => { $('#search').value = ''; selected = null; $('#details').textContent = 'Select a city to begin.'; render(); });
load().catch(err => { $('#details').textContent = 'Data could not be loaded: ' + err; });

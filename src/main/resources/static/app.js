const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const money = n => 'Bs ' + Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fecha = f => f ? new Date(f).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
let me = null;

async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (r.status === 401 && !url.endsWith('/login')) { showLogin(); throw new Error('Sesión expirada'); }
  if (!r.ok) throw new Error(data?.error || ('Error ' + r.status));
  return data;
}

/* ---------- Login ---------- */
function showLogin() { $('#app').hidden = true; $('#login').hidden = false; }
function showApp() {
  $('#login').hidden = true; $('#app').hidden = false;
  $('#whoName').textContent = me.usuario;
  $('#whoRole').textContent = me.rol === 'ADMIN' ? 'Administrador' : 'Empleado';
  $('#avatar').textContent = me.usuario.charAt(0);
  $('#nav').innerHTML = MENU.filter(m => !m[2] || me.rol === 'ADMIN')
    .map(m => `<button data-k="${m[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[m[0]] || ''}</svg>${m[1]}</button>`).join('');
  document.querySelectorAll('#nav button').forEach(b => b.onclick = () => render(b.dataset.k));
  render('dashboard');
}
$('#loginForm').onsubmit = async e => {
  e.preventDefault(); $('#err').textContent = '';
  try {
    me = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ usuario: $('#u').value.trim(), password: $('#p').value }) });
    $('#p').value = '';
    showApp();
  } catch (err) { $('#err').textContent = err.message; }
};
$('#btnOut').onclick = async () => { await fetch('/api/auth/logout', { method: 'POST' }); showLogin(); };

/* ---------- Menú ---------- */
const ICON = {
  dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  ventas: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
  compras: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  productos: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1"/>',
  inventario: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8"/><path d="M10 12h4"/>',
  categorias: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  clientes: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14c2.2.7 3.5 2.7 3.5 6"/>',
  proveedores: '<path d="M2 6h11v10H2z"/><path d="M13 9h5l3 3v4h-8"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  pagos: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/><path d="M6 15h4"/>',
  empleados: '<path d="M12 3l8 3v6c0 5-3.5 8-9 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'
};
const MENU = [['dashboard','Panel general'],['ventas','Ventas'],['compras','Compras'],['productos','Productos'],
  ['inventario','Inventario'],['categorias','Categorías'],['clientes','Clientes'],['proveedores','Proveedores'],
  ['pagos','Pagos'],['empleados','Empleados',true]];

/* ---------- CRUD genérico ---------- */
const ENT = {
  productos: {
    cols: [['codigo','Código'],['nombre','Nombre'],['categoria.nombre','Categoría'],['proveedor.nombre','Proveedor'],['precioCompra','P. compra'],['precioVenta','P. venta'],['stock','Stock'],['stockMinimo','Mín.']],
    fields: [['codigo','Código'],['nombre','Nombre'],['categoria','Categoría',{ref:'categorias'}],['proveedor','Proveedor',{ref:'proveedores'}],
      ['precioCompra','Precio compra',{type:'number'}],['precioVenta','Precio venta',{type:'number'}],['stock','Stock',{type:'number'}],['stockMinimo','Stock mínimo',{type:'number'}]]
  },
  categorias: { cols: [['nombre','Nombre'],['descripcion','Descripción']], fields: [['nombre','Nombre'],['descripcion','Descripción']] },
  clientes: {
    cols: [['nombre','Nombre'],['ciNit','CI/NIT'],['telefono','Teléfono'],['direccion','Dirección']],
    fields: [['nombre','Nombre'],['ciNit','CI/NIT'],['telefono','Teléfono'],['direccion','Dirección']]
  },
  proveedores: {
    cols: [['nombre','Nombre'],['telefono','Teléfono'],['email','Email'],['direccion','Dirección']],
    fields: [['nombre','Nombre'],['telefono','Teléfono'],['email','Email'],['direccion','Dirección']]
  },
  empleados: {
    cols: [['nombre','Nombre'],['usuario','Usuario'],['rol','Rol'],['activo','Activo']],
    fields: [['nombre','Nombre'],['usuario','Usuario'],['password','Contraseña (vacía = no cambiar)',{type:'password'}],
      ['rol','Rol',{options:['EMPLEADO','ADMIN']}],['activo','Activo',{bool:true}]]
  }
};

async function crudView(name) {
  const c = ENT[name];
  const rows = await api('/api/' + name);
  const refs = {};
  for (const f of c.fields) if (f[2]?.ref) refs[f[2].ref] = await api('/api/' + f[2].ref);
  let editing = null;

  const inputs = c.fields.map(([k, l, o = {}]) => {
    const id = 'f_' + k;
    if (o.ref) return `<label>${l}<select id="${id}"><option value="">—</option>${refs[o.ref].map(x => `<option value="${x.id}">${esc(x.nombre)}</option>`).join('')}</select></label>`;
    if (o.options) return `<label>${l}<select id="${id}">${o.options.map(x => `<option>${x}</option>`).join('')}</select></label>`;
    if (o.bool) return `<label class="chk"><input type="checkbox" id="${id}" checked> ${l}</label>`;
    return `<label>${l}<input id="${id}" type="${o.type || 'text'}" step="any" ${o.type === 'password' ? 'autocomplete="new-password"' : ''}></label>`;
  }).join('');

  $('#view').innerHTML = `
    <form id="frm" class="card"><div class="grid">${inputs}</div>
      <div class="actions"><button type="submit">Guardar</button><button type="button" id="clear" class="sec">Limpiar</button></div>
      <p id="msg" class="err"></p></form>
    <table><thead><tr>${c.cols.map(x => `<th>${x[1]}</th>`).join('')}<th></th></tr></thead><tbody>
    ${rows.map(r => `<tr>${c.cols.map(x => `<td>${esc(get(r, x[0]))}</td>`).join('')}
      <td><button data-e="${r.id}" class="sec">Editar</button> <button data-d="${r.id}" class="danger">Borrar</button></td></tr>`).join('')}
    </tbody></table>`;

  const fill = r => {
    editing = r ? r.id : null;
    for (const [k, , o = {}] of c.fields) {
      const el = $('#f_' + k);
      if (o.ref) el.value = r?.[k]?.id ?? '';
      else if (o.bool) el.checked = r ? !!r[k] : true;
      else if (o.options) el.value = r ? r[k] : o.options[0];
      else el.value = (r && k !== 'password') ? (r[k] ?? '') : '';
    }
  };
  $('#clear').onclick = () => fill(null);
  $('#frm').onsubmit = async e => {
    e.preventDefault();
    const body = {};
    for (const [k, , o = {}] of c.fields) {
      const el = $('#f_' + k);
      if (o.ref) body[k] = el.value ? { id: Number(el.value) } : null;
      else if (o.bool) body[k] = el.checked;
      else if (o.type === 'number') body[k] = el.value === '' ? 0 : Number(el.value);
      else body[k] = el.value;
    }
    try {
      await api('/api/' + name + (editing ? '/' + editing : ''), { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
      render(name);
    } catch (err) { $('#msg').textContent = err.message; }
  };
  document.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { fill(rows.find(r => r.id == b.dataset.e)); window.scrollTo(0, 0); });
  document.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Eliminar este registro?')) return;
    try { await api('/api/' + name + '/' + b.dataset.d, { method: 'DELETE' }); render(name); }
    catch (err) { $('#msg').textContent = err.message; }
  });
}

/* ---------- Dashboard / reportes ---------- */
async function dashboard() {
  const [r, mv, al, vs] = await Promise.all([api('/api/reportes/resumen'), api('/api/reportes/mas-vendidos'), api('/api/inventario/alertas'), api('/api/ventas')]);
  const ticket = r.cantidadVentas ? r.totalVentas / r.cantidadVentas : 0;
  const maxQ = Math.max(1, ...mv.map(x => Number(x.cantidad)));

  const porMetodo = {};
  vs.forEach(v => { const m = v.metodoPago || 'EFECTIVO'; porMetodo[m] = (porMetodo[m] || 0) + Number(v.total || 0); });
  const totalMetodos = Object.values(porMetodo).reduce((a, b) => a + b, 0);
  const NOMBRE = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
  const COLOR = { EFECTIVO: 'var(--accent)', TARJETA: 'var(--accent-2)', TRANSFERENCIA: 'var(--accent-3)' };
  const metodos = Object.entries(porMetodo).sort((a, b) => b[1] - a[1]);

  $('#view').innerHTML = `
    <section class="kpis" aria-label="Indicadores">
      <div class="kpi main"><span>Ventas totales</span><b>${money(r.totalVentas)}</b><small>Ticket promedio ${money(ticket)}</small></div>
      <div class="kpi"><span>N.º de ventas</span><b>${r.cantidadVentas}</b></div>
      <div class="kpi"><span>Compras totales</span><b>${money(r.totalCompras)}</b></div>
      <div class="kpi"><span>Productos</span><b>${r.productos}</b></div>
      <div class="kpi ${r.stockBajo ? 'warn' : ''}"><span>Stock bajo</span><b>${r.stockBajo}</b><small>${r.stockBajo ? 'Por reponer' : 'Todo en orden'}</small></div>
    </section>

    <div class="panels a">
      <section class="panel">
        <div class="panel-h"><h3>Productos más vendidos</h3><small>Unidades</small></div>
        ${mv.length ? `<ul class="list">${mv.map(x => `<li><div class="li-top"><span>${esc(x.producto)}</span><span>${x.cantidad}</span></div>
          <div class="track"><div class="fill" style="width:${Math.round(Number(x.cantidad) / maxQ * 100)}%"></div></div></li>`).join('')}</ul>`
          : '<p class="empty">Aún no hay ventas. Registra la primera desde la sección Ventas.</p>'}
      </section>
      <section class="panel">
        <div class="panel-h"><h3>Alertas de stock mínimo</h3><small>Stock actual / mínimo</small></div>
        ${al.length ? `<ul class="list">${al.map(p => `<li><div class="li-top"><span>${esc(p.nombre)}</span><span class="bajo">${p.stock} de ${p.stockMinimo}</span></div>
          <div class="track"><div class="fill alert" style="width:${p.stockMinimo ? Math.min(100, Math.round(p.stock / p.stockMinimo * 100)) : 0}%"></div></div></li>`).join('')}</ul>`
          : '<p class="empty">Todos los productos están por encima de su stock mínimo.</p>'}
      </section>
    </div>

    <div class="panels b">
      <section class="panel">
        <div class="panel-h"><h3>Últimas ventas</h3><small>${vs.length ? 'Las 6 más recientes' : ''}</small></div>
        ${vs.length ? `<table><thead><tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Total</th></tr></thead><tbody>
          ${vs.slice(0, 6).map(v => `<tr><td>${v.id}</td><td>${fecha(v.fecha)}</td><td>${esc(v.cliente?.nombre || 'Mostrador')}</td><td>${NOMBRE[v.metodoPago] || ''}</td><td>${money(v.total)}</td></tr>`).join('')}</tbody></table>`
          : '<p class="empty">Sin ventas registradas.</p>'}
      </section>
      <section class="panel">
        <div class="panel-h"><h3>Ventas por método de pago</h3></div>
        ${metodos.length ? `<div class="split">${metodos.map(([m, t]) => `<i style="width:${t / totalMetodos * 100}%;background:${COLOR[m] || 'var(--accent-3)'}"></i>`).join('')}</div>
          <ul class="legend">${metodos.map(([m, t]) => `<li><span class="dot" style="background:${COLOR[m] || 'var(--accent-3)'}"></span><span class="nm">${NOMBRE[m] || m}</span><span class="vl">${money(t)} · ${Math.round(t / totalMetodos * 100)}%</span></li>`).join('')}</ul>`
          : '<p class="empty">Sin datos todavía.</p>'}
      </section>
    </div>`;
}

async function inventario() {
  const ps = await api('/api/productos');
  $('#view').innerHTML = `<table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead><tbody>
    ${ps.map(p => `<tr><td>${esc(p.codigo)}</td><td>${esc(p.nombre)}</td><td>${esc(p.categoria?.nombre)}</td><td>${p.stock}</td><td>${p.stockMinimo}</td>
      <td><span class="badge ${p.stock <= p.stockMinimo ? 'bajo' : 'ok'}">${p.stock <= p.stockMinimo ? 'Stock bajo' : 'Disponible'}</span></td></tr>`).join('')}</tbody></table>`;
}

async function pagos() {
  const ps = await api('/api/pagos');
  $('#view').innerHTML = `<table><thead><tr><th>ID</th><th>Venta</th><th>Método</th><th>Monto</th><th>Fecha</th></tr></thead><tbody>
    ${ps.map(p => `<tr><td>${p.id}</td><td>#${p.ventaId}</td><td>${p.metodo}</td><td>${money(p.monto)}</td><td>${fecha(p.fecha)}</td></tr>`).join('')}</tbody></table>`;
}

/* ---------- Ventas y compras ---------- */
async function orden(kind) {
  const V = kind === 'ventas';
  const [prods, parties, hist] = await Promise.all([api('/api/productos'), api(V ? '/api/clientes' : '/api/proveedores'), api('/api/' + kind)]);
  const opt = prods.map(p => `<option value="${p.id}">${esc(p.nombre)} (stock ${p.stock}) — ${money(V ? p.precioVenta : p.precioCompra)}</option>`).join('');

  $('#view').innerHTML = `
    <form id="of" class="card">
      <div class="grid">
        <label>${V ? 'Cliente' : 'Proveedor'}<select id="party"><option value="">${V ? 'Mostrador (sin cliente)' : '—'}</option>
          ${parties.map(x => `<option value="${x.id}">${esc(x.nombre)}</option>`).join('')}</select></label>
        ${V ? `<label>Método de pago<select id="metodo"><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option></select></label>` : ''}
      </div>
      <div id="items"></div>
      <div class="actions"><button type="button" id="add" class="sec">+ Producto</button><button type="submit">${V ? 'Registrar venta' : 'Registrar compra'}</button></div>
      <p id="msg" class="err"></p>
    </form>
    <h3 class="sec-title">Historial</h3>
    <table><thead><tr><th>ID</th><th>Fecha</th><th>${V ? 'Cliente' : 'Proveedor'}</th>${V ? '<th>Vendedor</th><th>Pago</th>' : ''}<th>Total</th></tr></thead><tbody>
    ${hist.map(h => `<tr><td>${h.id}</td><td>${fecha(h.fecha)}</td><td>${esc(V ? (h.cliente?.nombre || 'Mostrador') : h.proveedor?.nombre)}</td>
      ${V ? `<td>${esc(h.empleado?.nombre)}</td><td>${h.metodoPago}</td>` : ''}<td>${money(h.total)}</td></tr>`).join('')}</tbody></table>`;

  const addRow = () => {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `<select class="ip">${opt}</select><input class="iq" type="number" min="1" value="1" title="Cantidad">
      ${V ? '' : '<input class="ic" type="number" step="any" min="0" placeholder="Costo unit." title="Costo unitario">'}<button type="button" class="danger">Quitar</button>`;
    d.querySelector('button').onclick = () => d.remove();
    $('#items').appendChild(d);
  };
  addRow();
  $('#add').onclick = addRow;
  $('#of').onsubmit = async e => {
    e.preventDefault(); $('#msg').textContent = '';
    const items = [...document.querySelectorAll('#items .row')].map(r => {
      const it = { productoId: Number(r.querySelector('.ip').value), cantidad: Number(r.querySelector('.iq').value) };
      if (!V) { const c = r.querySelector('.ic').value; it.costoUnitario = c === '' ? null : Number(c); }
      return it;
    });
    const party = $('#party').value ? Number($('#party').value) : null;
    const body = V ? { clienteId: party, metodoPago: $('#metodo').value, items } : { proveedorId: party, items };
    try { await api('/api/' + kind, { method: 'POST', body: JSON.stringify(body) }); render(kind); }
    catch (err) { $('#msg').textContent = err.message; }
  };
}

/* ---------- Router ---------- */
async function render(name) {
  $('#title').textContent = MENU.find(m => m[0] === name)?.[1] || '';
  $('#sub').textContent = name === 'dashboard' ? new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.k === name));
  try {
    if (name === 'dashboard') await dashboard();
    else if (name === 'ventas' || name === 'compras') await orden(name);
    else if (name === 'inventario') await inventario();
    else if (name === 'pagos') await pagos();
    else await crudView(name);
  } catch (e) {
    if (e.message !== 'Sesión expirada') $('#view').innerHTML = `<p class="err">${esc(e.message)}</p>`;
  }
}

/* ---------- Inicio ---------- */
(async () => {
  try { me = await api('/api/auth/me'); showApp(); } catch { showLogin(); }
})();

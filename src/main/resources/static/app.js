const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
const money = n => 'Bs ' + Number(n || 0).toFixed(2);
const fecha = f => f ? new Date(f).toLocaleString() : '';
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
  $('#who').textContent = me.usuario + ' (' + me.rol + ')';
  $('#nav').innerHTML = MENU.filter(m => !m[2] || me.rol === 'ADMIN')
    .map(m => `<button data-k="${m[0]}">${m[1]}</button>`).join('');
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
const MENU = [['dashboard','Dashboard'],['ventas','Ventas'],['compras','Compras'],['productos','Productos'],
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
  const [r, mv, al] = await Promise.all([api('/api/reportes/resumen'), api('/api/reportes/mas-vendidos'), api('/api/inventario/alertas')]);
  const stats = [['Ventas totales', money(r.totalVentas)], ['N.º de ventas', r.cantidadVentas], ['Compras totales', money(r.totalCompras)],
    ['Productos', r.productos], ['Con stock bajo', r.stockBajo]];
  $('#view').innerHTML = `
    <div class="stats">${stats.map(([a, b]) => `<div class="stat"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
    <div class="two">
      <div><h3>Productos más vendidos</h3><table><thead><tr><th>Producto</th><th>Unidades</th></tr></thead><tbody>
        ${mv.map(x => `<tr><td>${esc(x.producto)}</td><td>${x.cantidad}</td></tr>`).join('') || '<tr><td colspan="2">Sin ventas aún</td></tr>'}</tbody></table></div>
      <div><h3>⚠️ Alertas de stock mínimo</h3><table><thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead><tbody>
        ${al.map(p => `<tr><td>${esc(p.nombre)}</td><td class="bajo">${p.stock}</td><td>${p.stockMinimo}</td></tr>`).join('') || '<tr><td colspan="3">Todo en orden</td></tr>'}</tbody></table></div>
    </div>`;
}

async function inventario() {
  const ps = await api('/api/productos');
  $('#view').innerHTML = `<table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead><tbody>
    ${ps.map(p => `<tr><td>${esc(p.codigo)}</td><td>${esc(p.nombre)}</td><td>${esc(p.categoria?.nombre)}</td><td>${p.stock}</td><td>${p.stockMinimo}</td>
      <td class="${p.stock <= p.stockMinimo ? 'bajo' : 'ok'}">${p.stock <= p.stockMinimo ? 'Stock bajo' : 'OK'}</td></tr>`).join('')}</tbody></table>`;
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
    <h3>Historial</h3>
    <table><thead><tr><th>ID</th><th>Fecha</th><th>${V ? 'Cliente' : 'Proveedor'}</th>${V ? '<th>Vendedor</th><th>Pago</th>' : ''}<th>Total</th></tr></thead><tbody>
    ${hist.map(h => `<tr><td>${h.id}</td><td>${fecha(h.fecha)}</td><td>${esc(V ? (h.cliente?.nombre || 'Mostrador') : h.proveedor?.nombre)}</td>
      ${V ? `<td>${esc(h.empleado?.nombre)}</td><td>${h.metodoPago}</td>` : ''}<td>${money(h.total)}</td></tr>`).join('')}</tbody></table>`;

  const addRow = () => {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `<select class="ip">${opt}</select><input class="iq" type="number" min="1" value="1" title="Cantidad">
      ${V ? '' : '<input class="ic" type="number" step="any" min="0" placeholder="Costo unit." title="Costo unitario">'}<button type="button" class="danger">✕</button>`;
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

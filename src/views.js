const statusMeta = {
  lead: { label: 'Lead', tone: 'warning' },
  active: { label: 'Ativo', tone: 'success' },
  inactive: { label: 'Inativo', tone: 'neutral' }
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function icon(name) {
  const paths = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
    arrow: '<path d="m15 18-6-6 6-6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

function layout({ title, content, active = 'clients', message = '' }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#111827">
  <title>${escapeHtml(title)} · Control System</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="/" aria-label="Control System - inicio">
        <span class="brand-mark">C</span>
        <span><strong>Control</strong><small>System</small></span>
      </a>
      <nav class="nav" aria-label="Navegacao principal">
        <a class="nav-link ${active === 'clients' ? 'active' : ''}" href="/">${icon('users')}<span>Clientes</span></a>
      </nav>
      <div class="sidebar-note">
        <span class="dot"></span>
        <div><strong>Banco local</strong><small>SQLite conectado</small></div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="icon-button mobile-menu" type="button" data-menu aria-label="Abrir menu">${icon('menu')}</button>
        <div>
          <p class="eyebrow">Workspace</p>
          <h1>${escapeHtml(title)}</h1>
        </div>
        <div class="profile" aria-label="Perfil atual"><span>EB</span><div><strong>Emanuel</strong><small>Administrador</small></div></div>
      </header>
      ${message ? `<div class="toast" role="status">${icon('check')}<span>${escapeHtml(message)}</span></div>` : ''}
      <section class="content">${content}</section>
    </main>
  </div>
  <script src="/app.js" defer></script>
</body>
</html>`;
}

export function listView({ clients, stats, search = '', status = 'all', message = '' }) {
  const rows = clients.map((client) => {
    const meta = statusMeta[client.status];
    const initials = client.name.split(/\s+/).slice(0,2).map((part) => part[0]?.toUpperCase() || '').join('');
    return `<tr>
      <td>
        <div class="client-cell">
          <span class="avatar">${escapeHtml(initials)}</span>
          <div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.email)}</small></div>
        </div>
      </td>
      <td>${client.company ? escapeHtml(client.company) : '<span class="muted">—</span>'}</td>
      <td>${client.phone ? escapeHtml(client.phone) : '<span class="muted">—</span>'}</td>
      <td><span class="badge ${meta.tone}">${meta.label}</span></td>
      <td class="actions-cell">
        <a class="icon-button" href="/clients/${client.id}/edit" aria-label="Editar ${escapeHtml(client.name)}">${icon('edit')}</a>
        <form action="/clients/${client.id}/delete" method="post" data-delete-form data-name="${escapeHtml(client.name)}">
          <button class="icon-button danger" type="submit" aria-label="Excluir ${escapeHtml(client.name)}">${icon('trash')}</button>
        </form>
      </td>
    </tr>`;
  }).join('');

  const empty = `<div class="empty-state">
    <div class="empty-icon">${icon('users')}</div>
    <h3>Nenhum cliente encontrado</h3>
    <p>Ajuste os filtros ou cadastre um novo cliente para comecar.</p>
    <a class="button primary" href="/clients/new">${icon('plus')} Novo cliente</a>
  </div>`;

  const content = `
    <div class="page-heading">
      <div><p class="eyebrow">Relacionamento</p><h2>Gerencie sua base de clientes</h2><p>Centralize contatos, empresas e status em um unico lugar.</p></div>
      <a class="button primary" href="/clients/new">${icon('plus')} Novo cliente</a>
    </div>

    <div class="stats-grid">
      <article class="stat-card"><span class="stat-icon">${icon('users')}</span><div><small>Total de clientes</small><strong>${stats.total}</strong><span>Base cadastrada</span></div></article>
      <article class="stat-card"><span class="stat-icon success-bg">${icon('check')}</span><div><small>Clientes ativos</small><strong>${stats.active || 0}</strong><span>Em relacionamento</span></div></article>
      <article class="stat-card"><span class="stat-icon warning-bg">${icon('briefcase')}</span><div><small>Leads</small><strong>${stats.leads || 0}</strong><span>Oportunidades abertas</span></div></article>
    </div>

    <section class="panel">
      <div class="panel-toolbar">
        <form class="filters" action="/" method="get">
          <label class="search-field">
            ${icon('search')}
            <span class="sr-only">Buscar clientes</span>
            <input name="search" value="${escapeHtml(search)}" placeholder="Buscar por nome, empresa, e-mail..." autocomplete="off">
          </label>
          <label class="select-field">
            <span class="sr-only">Filtrar por status</span>
            <select name="status" onchange="this.form.submit()">
              <option value="all" ${status === 'all' ? 'selected' : ''}>Todos os status</option>
              <option value="lead" ${status === 'lead' ? 'selected' : ''}>Leads</option>
              <option value="active" ${status === 'active' ? 'selected' : ''}>Ativos</option>
              <option value="inactive" ${status === 'inactive' ? 'selected' : ''}>Inativos</option>
            </select>
          </label>
          <button class="button secondary" type="submit">Filtrar</button>
        </form>
        <span class="result-count">${clients.length} ${clients.length === 1 ? 'registro' : 'registros'}</span>
      </div>
      ${clients.length ? `<div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Empresa</th><th>Telefone</th><th>Status</th><th><span class="sr-only">Acoes</span></th></tr></thead><tbody>${rows}</tbody></table></div>` : empty}
    </section>`;

  return layout({ title: 'Clientes', content, message });
}

export function formView({ client = {}, errors = {}, mode = 'create', message = '' }) {
  const editing = mode === 'edit';
  const action = editing ? `/clients/${client.id}` : '/clients';
  const field = (name, label, type = 'text', placeholder = '', extra = '') => `
    <label class="field ${errors[name] ? 'has-error' : ''}">
      <span>${label}</span>
      <input type="${type}" name="${name}" value="${escapeHtml(client[name] || '')}" placeholder="${placeholder}" ${extra}>
      ${errors[name] ? `<small class="field-error">${escapeHtml(errors[name])}</small>` : ''}
    </label>`;

  const content = `
    <div class="breadcrumb"><a href="/">Clientes</a>${icon('chevron')}<span>${editing ? 'Editar cliente' : 'Novo cliente'}</span></div>
    <div class="form-layout">
      <section class="form-card">
        <div class="form-header">
          <a class="icon-button" href="/" aria-label="Voltar">${icon('arrow')}</a>
          <div><p class="eyebrow">Cadastro</p><h2>${editing ? 'Editar cliente' : 'Adicionar cliente'}</h2><p>${editing ? 'Atualize as informacoes mantendo a base organizada.' : 'Preencha os dados essenciais para adicionar um novo contato.'}</p></div>
        </div>
        <form class="client-form" action="${action}" method="post" novalidate>
          <div class="form-section">
            <div class="section-title"><span>01</span><div><strong>Dados principais</strong><small>Informacoes de identificacao do cliente.</small></div></div>
            <div class="form-grid two">
              ${field('name', 'Nome completo *', 'text', 'Ex.: Ana Martins', 'required maxlength="100" autocomplete="name"')}
              ${field('company', 'Empresa', 'text', 'Ex.: Aurora Studio', 'maxlength="120" autocomplete="organization"')}
              ${field('email', 'E-mail *', 'email', 'ana@empresa.com', 'required maxlength="160" autocomplete="email"')}
              ${field('phone', 'Telefone', 'tel', '(00) 00000-0000', 'maxlength="30" autocomplete="tel"')}
            </div>
          </div>
          <div class="form-section">
            <div class="section-title"><span>02</span><div><strong>Relacionamento</strong><small>Classifique o momento atual deste contato.</small></div></div>
            <div class="form-grid two align-start">
              <label class="field"><span>Status</span><select name="status">
                <option value="lead" ${(client.status || 'lead') === 'lead' ? 'selected' : ''}>Lead</option>
                <option value="active" ${client.status === 'active' ? 'selected' : ''}>Ativo</option>
                <option value="inactive" ${client.status === 'inactive' ? 'selected' : ''}>Inativo</option>
              </select></label>
              <label class="field ${errors.notes ? 'has-error' : ''}"><span>Observacoes</span><textarea name="notes" rows="5" maxlength="1000" placeholder="Contexto, preferencias ou proximos passos...">${escapeHtml(client.notes || '')}</textarea>${errors.notes ? `<small class="field-error">${escapeHtml(errors.notes)}</small>` : ''}</label>
            </div>
          </div>
          <div class="form-actions"><a class="button secondary" href="/">Cancelar</a><button class="button primary" type="submit">${editing ? 'Salvar alteracoes' : 'Cadastrar cliente'}</button></div>
        </form>
      </section>
      <aside class="help-card">
        <span class="help-icon">${icon('users')}</span>
        <h3>Base limpa, atendimento melhor.</h3>
        <p>Mantenha dados objetivos e atualizados. Isso facilita busca, segmentacao e proximos contatos.</p>
        <ul><li>${icon('mail')} E-mail unico por cliente</li><li>${icon('phone')} Telefone opcional</li><li>${icon('briefcase')} Status para priorizacao</li></ul>
      </aside>
    </div>`;

  return layout({ title: editing ? 'Editar cliente' : 'Novo cliente', content, message });
}

export function notFoundView() {
  return layout({ title: 'Pagina nao encontrada', content: `<div class="empty-state standalone"><div class="empty-icon">404</div><h2>Essa pagina nao existe</h2><p>O endereco pode ter mudado ou o registro nao esta mais disponivel.</p><a class="button primary" href="/">Voltar para clientes</a></div>` });
}

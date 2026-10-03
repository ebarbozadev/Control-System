const VALID_STATUSES = new Set(['lead', 'active', 'inactive']);

export function normalizeClient(input = {}) {
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '').trim().toLowerCase(),
    phone: String(input.phone || '').trim(),
    company: String(input.company || '').trim(),
    status: VALID_STATUSES.has(input.status) ? input.status : 'lead',
    notes: String(input.notes || '').trim()
  };
}

export function validateClient(client) {
  const errors = {};
  if (client.name.length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.';
  if (client.name.length > 100) errors.name = 'Use no maximo 100 caracteres.';
  if (!/^\S+@\S+\.\S+$/.test(client.email)) errors.email = 'Informe um e-mail valido.';
  if (client.email.length > 160) errors.email = 'Use no maximo 160 caracteres.';
  if (client.phone.length > 30) errors.phone = 'Use no maximo 30 caracteres.';
  if (client.company.length > 120) errors.company = 'Use no maximo 120 caracteres.';
  if (client.notes.length > 1000) errors.notes = 'Use no maximo 1000 caracteres.';
  return errors;
}

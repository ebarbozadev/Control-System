const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('[data-menu]');

menuButton?.addEventListener('click', () => sidebar?.classList.toggle('open'));

document.querySelectorAll('[data-delete-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const name = form.dataset.name || 'este cliente';
    if (!window.confirm(`Excluir ${name}? Esta acao nao pode ser desfeita.`)) event.preventDefault();
  });
});

const toast = document.querySelector('.toast');
if (toast) {
  window.setTimeout(() => toast.classList.add('hide'), 3200);
}

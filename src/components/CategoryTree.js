export function renderCategoryTree(categories, selectedCategoryId, onSelectCategory) {
  const container = document.createElement('div');
  container.className = 'category-tree-wrapper';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '6px';

  const allBtn = document.createElement('button');
  allBtn.className = `btn-sm nav-btn ${selectedCategoryId === null ? 'active' : ''}`;
  allBtn.style.width = '100%';
  allBtn.style.textAlign = 'left';
  allBtn.style.justifyContent = 'flex-start';
  allBtn.innerHTML = '🗂️ All Categories';
  allBtn.addEventListener('click', () => onSelectCategory(null));
  container.appendChild(allBtn);

  function buildList(nodes, depth = 0) {
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = `${depth * 14}px`;
    ul.style.margin = '4px 0';

    nodes.forEach(node => {
      const li = document.createElement('li');
      li.style.margin = '3px 0';

      const icon = (node.icon && node.icon.trim()) ? node.icon.trim() : '📂';

      const catBtn = document.createElement('button');
      catBtn.className = `btn-sm nav-btn ${selectedCategoryId === node.id ? 'active' : ''}`;
      catBtn.style.width = '100%';
      catBtn.style.textAlign = 'left';
      catBtn.style.justifyContent = 'flex-start';
      catBtn.style.fontSize = '0.9rem';
      catBtn.innerHTML = `${icon} ${node.name}`;
      catBtn.addEventListener('click', () => onSelectCategory(node.id));

      li.appendChild(catBtn);

      if (Array.isArray(node.children) && node.children.length > 0) {
        li.appendChild(buildList(node.children, depth + 1));
      }

      ul.appendChild(li);
    });
    return ul;
  }

  if (Array.isArray(categories) && categories.length > 0) {
    container.appendChild(buildList(categories, 0));
  }

  return container;
}

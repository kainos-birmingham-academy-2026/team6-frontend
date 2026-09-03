(() => {
  const toolbar = document.querySelector("[data-role-filters]");
  const grid = document.querySelector("[data-role-grid]");
  if (!toolbar || !grid) return;

  const search = toolbar.querySelector("[data-filter-search]");
  const selects = Array.from(toolbar.querySelectorAll("[data-filter-field]"));
  const clearBtn = toolbar.querySelector("[data-filter-clear]");
  const resultCount = document.querySelector("[data-role-count]");
  const emptyState = document.querySelector("[data-role-empty]");
  const featured = document.querySelector(".featured-role[data-role-item]");
  const cards = Array.from(grid.querySelectorAll("[data-role-item]"));
  const items = featured ? [featured, ...cards] : cards;

  selects.forEach((select) => {
    const field = select.dataset.filterField;
    const values = [...new Set(items.map((item) => item.dataset[field]).filter(Boolean))].sort();
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  });

  const apply = () => {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    items.forEach((item) => {
      const matchesTerm = !term || item.textContent.toLowerCase().includes(term);
      const matchesSelects = selects.every((select) => {
        if (!select.value) return true;
        return item.dataset[select.dataset.filterField] === select.value;
      });
      const show = matchesTerm && matchesSelects;
      item.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = `${visible} ${visible === 1 ? "role" : "roles"}`;
    }
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };

  search?.addEventListener("input", apply);
  selects.forEach((select) => select.addEventListener("change", apply));
  clearBtn?.addEventListener("click", () => {
    if (search) search.value = "";
    selects.forEach((select) => {
      select.value = "";
    });
    apply();
  });

  apply();
})();

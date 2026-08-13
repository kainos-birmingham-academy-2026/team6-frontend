(() => {
  const toolbar = document.querySelector("[data-role-filters]");
  const table = document.querySelector("[data-role-table]");
  if (!toolbar || !table) return;

  const search = toolbar.querySelector("[data-filter-search]");
  const selects = Array.from(toolbar.querySelectorAll("[data-filter-field]"));
  const clearBtn = toolbar.querySelector("[data-filter-clear]");
  const resultCount = document.querySelector("[data-role-count]");
  const emptyState = document.querySelector("[data-role-empty]");
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  selects.forEach((select) => {
    const field = select.dataset.filterField;
    const values = [...new Set(rows.map((row) => row.dataset[field]).filter(Boolean))].sort();
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

    rows.forEach((row) => {
      const matchesTerm = !term || row.textContent.toLowerCase().includes(term);
      const matchesSelects = selects.every((select) => {
        if (!select.value) return true;
        return row.dataset[select.dataset.filterField] === select.value;
      });
      const show = matchesTerm && matchesSelects;
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = `${visible} ${visible === 1 ? "role" : "roles"}`;
    }
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
    table.hidden = visible === 0;
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

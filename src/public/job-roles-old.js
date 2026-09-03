(() => {
  const toolbar = document.querySelector("[data-role-filters]");
  const grid = document.querySelector("[data-role-grid]");
  if (!toolbar || !grid) return;

  const search = toolbar.querySelector("[data-filter-search]");
  const capabilityFilters = Array.from(toolbar.querySelectorAll("[data-filter-capability]"));
  const bandFilters = Array.from(toolbar.querySelectorAll("[data-filter-band]"));
  const locationFilters = Array.from(toolbar.querySelectorAll("[data-filter-location]"));
  const clearBtn = toolbar.querySelector("[data-filter-clear]");
  const resultCount = document.querySelector("[data-role-count]");
  const emptyState = document.querySelector("[data-role-empty]");
  const featured = document.querySelector(".featured-role[data-role-item]");
  const initialCards = Array.from(grid.querySelectorAll("[data-role-item]"));
  let roles = initialCards.map((item) => ({
    jobRoleId: item.querySelector("a")?.getAttribute("href")?.split("/").pop(),
    roleName: item.querySelector(".role-card-title")?.textContent?.trim(),
    location: item.dataset.location,
    capabilityName: item.dataset.capability,
    bandName: item.dataset.band,
    closingDate: item.dataset.sortClosing
  }));
  if (featured) {
    roles.unshift({
      jobRoleId: featured.querySelector("h2 a")?.getAttribute("href")?.split("/").pop(),
      roleName: featured.querySelector("h2")?.textContent?.trim(),
      location: featured.dataset.location,
      capabilityName: featured.dataset.capability,
      bandName: featured.dataset.band,
      closingDate: featured.dataset.sortClosing
    });
  }

  const selectedValues = (filters) => filters.filter((filter) => filter.checked).map((filter) => filter.value);

  const renderRole = (role) => {
    const article = document.createElement("article");
    article.className = "role-card reveal is-visible";
    article.dataset.roleItem = "";
    article.innerHTML = `
      <div class="role-card-head"><span class="role-card-icon" aria-hidden="true">&#10022;</span><p class="role-card-cap"></p></div>
      <div class="role-card-body"><h2 class="role-card-title"><a class="role-name-link"></a></h2>
        <p class="role-card-meta"><span class="role-card-location"></span><span class="pill pill-band"></span></p></div>
      <div class="role-card-foot"><p class="closing"></p><a class="card-cta">View More Info</a></div>`;
    article.querySelector(".role-card-cap").textContent = role.capabilityName || role.capabilityId || "N/A";
    article.querySelector(".role-name-link").textContent = role.roleName || "Unnamed role";
    article.querySelector(".role-name-link").href = `/job-roles/${role.jobRoleId}`;
    article.querySelector(".role-card-location").textContent = role.location || "N/A";
    article.querySelector(".pill-band").textContent = role.bandName || role.bandId || "N/A";
    article.querySelector(".closing").textContent = role.closingDate || "Closing date unavailable";
    article.querySelector(".card-cta").href = `/job-roles/${role.jobRoleId}`;
    return article;
  };

  const renderResults = () => {
    grid.replaceChildren(...roles.map(renderRole));
    if (featured) featured.hidden = true;
    const count = roles.length;
    if (resultCount) resultCount.textContent = `${count} ${count === 1 ? "role" : "roles"}`;
    if (emptyState) emptyState.hidden = count !== 0;
  };

  const showError = (message) => {
    let error = toolbar.querySelector("[data-role-filter-error]");
    if (!error) {
      error = document.createElement("p");
      error.className = "message message-error";
      error.dataset.roleFilterError = "";
      toolbar.appendChild(error);
    }
    error.textContent = message;
  };

  const apply = async () => {
    const queryParams = new URLSearchParams();
    const term = (search?.value || "").trim();
    const capabilities = selectedValues(capabilityFilters);
    const bands = selectedValues(bandFilters);
    const locations = selectedValues(locationFilters);
    if (term) queryParams.set("search", term);
    if (capabilities.length) queryParams.set("capabilities", capabilities.join(","));
    if (bands.length) queryParams.set("bands", bands.join(","));
    if (locations.length) queryParams.set("locations", locations.join(","));

    try {
      const response = await fetch(`/api/jobRoles?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(response.status === 400 ? "Invalid filter selection." : "Unable to load filtered roles right now.");
      }
      roles = await response.json();
      toolbar.querySelector("[data-role-filter-error]")?.remove();
      renderResults();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to load filtered roles right now.");
    }
  };

  let searchTimer;
  search?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(apply, 250);
  });
  [...capabilityFilters, ...bandFilters, ...locationFilters].forEach((filter) => filter.addEventListener("change", apply));
  clearBtn?.addEventListener("click", () => {
    if (search) search.value = "";
    [...capabilityFilters, ...bandFilters, ...locationFilters].forEach((filter) => { filter.checked = false; });
    apply();
  });

  if (resultCount) resultCount.textContent = `${roles.length} ${roles.length === 1 ? "role" : "roles"}`;
})();

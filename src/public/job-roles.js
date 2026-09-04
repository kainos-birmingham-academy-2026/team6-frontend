(() => {
  const formatClosingDate = (value) => {
    if (!value) return "Closing date unavailable";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    const day = String(parsed.getUTCDate()).padStart(2, "0");
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const year = String(parsed.getUTCFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const toolbar = document.querySelector("[data-role-filters]");
  const grid = document.querySelector("[data-role-grid]");
  if (!toolbar || !grid) return;

  // Get initial roles from DOM
  const featured = document.querySelector(".featured-role[data-role-item]");
  const initialCards = Array.from(grid.querySelectorAll("[data-role-item]"));
  let roles = initialCards.map((item) => ({
    jobRoleId: item.querySelector("a")?.getAttribute("href")?.split("/").pop(),
    roleName: item.querySelector(".role-card-title")?.textContent?.trim(),
    location: item.dataset.location,
    capabilityName: item.dataset.capability,
    bandName: item.dataset.band,
    closingDate: item.dataset.closingDate
  }));
  if (featured) {
    roles.unshift({
      jobRoleId: featured.querySelector("h2 a")?.getAttribute("href")?.split("/").pop(),
      roleName: featured.querySelector("h2")?.textContent?.trim(),
      location: featured.dataset.location,
      capabilityName: featured.dataset.capability,
      bandName: featured.dataset.band,
      closingDate: featured.dataset.closingDate
    });
  }

  const searchInput = toolbar.querySelector("[data-filter-search]");
  const countElement = toolbar.querySelector("[data-role-count]");
  const emptyState = document.querySelector("[data-role-empty]");
  const getSelectedValues = (selector) =>
    Array.from(toolbar.querySelectorAll(`${selector}:checked`))
      .map((input) => input.value.trim())
      .filter(Boolean);

  const getFilters = () => {
    return {
      capabilities: getSelectedValues("[data-filter-capability]"),
      bands: getSelectedValues("[data-filter-band]"),
      locations: getSelectedValues("[data-filter-location]")
    };
  };

  const CAPABILITY_ICONS = {
    engineering: "</>",
    "software engineering": "</>",
    "backend engineering": "</>",
    "backend development": "</>",
    "frontend development": "</>",
    "cloud and engineering": "</>",
    devops: "</>",
    data: "◧",
    "data & ai": "◧",
    "data and ai": "◧",
    "data science": "◧",
    design: "✎",
    "experience design": "✎",
    "user-centred design": "✎",
    workday: "⬡",
    product: "◆",
    delivery: "◆",
    "delivery & product": "◆"
  };

  const capabilityIcon = (name) => CAPABILITY_ICONS[String(name).trim().toLowerCase()] || "✦";

  // Mirrors capabilityAccent in jobRoleController.ts so client-rendered cards keep their colour.
  const capabilityAccent = (name) => {
    let hash = 0;
    for (const character of String(name)) {
      hash = (hash * 31 + character.charCodeAt(0)) % 5;
    }
    return hash + 1;
  };

  const daysUntil = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const startOfDay = (date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.round((startOfDay(parsed) - startOfDay(new Date())) / 86400000);
  };

  const closingUrgency = (days) => {
    if (days === null) return { label: "", className: "" };
    if (days < 0) return { label: "Closed", className: "closing-closed" };
    if (days === 0) return { label: "Closes today", className: "closing-urgent" };
    if (days === 1) return { label: "1 day left", className: "closing-urgent" };
    if (days <= 7) return { label: `${days} days left`, className: "closing-urgent" };
    if (days <= 14) return { label: `${days} days left`, className: "closing-soon" };
    return { label: "", className: "" };
  };

  const renderRole = (role) => {
    const capabilityDisplay = String(role.capabilityName || role.capabilityId || "N/A");
    const urgency = closingUrgency(daysUntil(role.closingDate));
    const article = document.createElement("article");
    article.className = `role-card cap-accent-${capabilityAccent(capabilityDisplay)} reveal is-visible`;
    article.dataset.roleItem = "";
    article.dataset.location = role.location || "";
    article.dataset.capability = capabilityDisplay;
    article.dataset.band = String(role.bandName || role.bandId || "N/A");
    article.innerHTML = `
      <div class="role-card-head"><span class="role-card-icon" aria-hidden="true"></span><p class="role-card-cap"></p></div>
      <div class="role-card-body"><h2 class="role-card-title"><a class="role-name-link"></a></h2>
        <p class="role-card-meta"><span class="role-card-location"></span><span class="pill pill-band"></span></p></div>
      <div class="role-card-foot"><p class="closing"></p><a class="card-cta">View More Info</a></div>`;
    article.querySelector(".role-card-icon").textContent = capabilityIcon(capabilityDisplay);
    article.querySelector(".role-card-cap").textContent = capabilityDisplay;
    article.querySelector(".role-name-link").textContent = role.roleName || "Unnamed role";
    article.querySelector(".role-name-link").href = `/job-roles/${role.jobRoleId}`;
    article.querySelector(".role-card-location").textContent = role.location || "N/A";
    article.querySelector(".pill-band").textContent = role.bandName || role.bandId || "N/A";

    const closing = article.querySelector(".closing");
    if (urgency.className) closing.classList.add(urgency.className);
    closing.textContent = urgency.label
      ? `${urgency.label} · ${formatClosingDate(role.closingDate)}`
      : formatClosingDate(role.closingDate);

    article.querySelector(".card-cta").href = `/job-roles/${role.jobRoleId}`;
    return article;
  };

  const renderResults = () => {
    grid.replaceChildren(...roles.map(renderRole));
    if (featured) featured.hidden = true;
    const count = roles.length;
    if (countElement) countElement.textContent = `${count}`;
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

  let requestNumber = 0;
  const fetchRoles = async (queryParams, locations) => {
    const response = await fetch(`/api/jobRoles?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(response.status === 400 ? "Invalid filter selection." : "Unable to load filtered roles right now.");
    }

    const filteredRoles = await response.json();
    if (filteredRoles.length || locations.length < 2) return filteredRoles;

    // Some backend versions treat a comma-separated location list as one value.
    const roleResults = await Promise.all(
      locations.map(async (location) => {
        const locationParams = new URLSearchParams(queryParams);
        locationParams.set("locations", location);
        const locationResponse = await fetch(`/api/jobRoles?${locationParams.toString()}`);
        if (!locationResponse.ok) {
          throw new Error(
            locationResponse.status === 400
              ? "Invalid filter selection."
              : "Unable to load filtered roles right now."
          );
        }
        return locationResponse.json();
      })
    );

    const uniqueRoles = new Map(roleResults.flat().map((role) => [String(role.jobRoleId), role]));
    return Array.from(uniqueRoles.values());
  };

  const apply = async () => {
    const currentRequest = ++requestNumber;
    const queryParams = new URLSearchParams();
    const term = (searchInput?.value || "").trim();
    const { capabilities, bands, locations } = getFilters();
    if (term) queryParams.set("search", term);
    if (capabilities.length) queryParams.set("capabilities", capabilities.join(","));
    if (bands.length) queryParams.set("bands", bands.join(","));
    if (locations.length) queryParams.set("locations", locations.join(","));

    // No filters left: reload so the server restores the paginated, sorted view.
    if (![...queryParams.keys()].length) {
      window.location.reload();
      return;
    }

    try {
      const nextRoles = await fetchRoles(queryParams, locations);
      if (currentRequest !== requestNumber) return;
      roles = nextRoles;
      toolbar.querySelector("[data-role-filter-error]")?.remove();
      // Filtered results aren't paged, so the page links no longer apply.
      document.querySelector(".pagination")?.setAttribute("hidden", "");
      renderResults();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to load filtered roles right now.");
    }
  };

  let searchTimer;
  searchInput?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(apply, 250);
  });

  toolbar
    .querySelectorAll("[data-filter-capability], [data-filter-band], [data-filter-location]")
    .forEach((input) => input.addEventListener("change", apply));
  toolbar.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    toolbar.querySelectorAll("input[type='checkbox']").forEach((input) => {
      input.checked = false;
    });
    apply();
  });
})();

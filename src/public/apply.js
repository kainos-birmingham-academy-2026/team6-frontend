(() => {
  const dropZone = document.querySelector("[data-file-drop]");
  if (!dropZone) return;

  const input = dropZone.querySelector("input[type='file']");
  const nameLabel = dropZone.querySelector("[data-file-name]");
  if (!input) return;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const showSelection = () => {
    const file = input.files?.[0];
    if (!nameLabel) return;

    if (!file) {
      nameLabel.hidden = true;
      dropZone.classList.remove("has-file");
      return;
    }

    nameLabel.textContent = `${file.name} · ${formatSize(file.size)}`;
    nameLabel.hidden = false;
    dropZone.classList.add("has-file");
  };

  input.addEventListener("change", showSelection);

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      if (eventName === "dragleave" && dropZone.contains(event.relatedTarget)) return;
      dropZone.classList.remove("is-dragging");
    });
  });

  dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    showSelection();
  });

  showSelection();
})();

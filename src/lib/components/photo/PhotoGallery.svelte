<script>
  import { Photos } from "$lib/services/photos.svelte";
  import { CameraSource } from "@capacitor/camera";
  import { Camera, X } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { Alert } from "$lib/core/alert";

  /**
   * @typedef {Object} Props
   * @property {string[]} [photo_ids]
   */

  /** @type {Props} */
  let { photo_ids = $bindable([]) } = $props();

  /** @type {TaskPhoto[]} */
  let photos = $state([]);
  let is_loading = $state(false);

  // Load photos when photo_ids change
  $effect(() => {
    if (photo_ids?.length) {
      loadPhotos();
    } else {
      photos = [];
    }
  });

  async function loadPhotos() {
    if (!photo_ids?.length) return;
    is_loading = true;
    photos = await Photos.loadPhotos(photo_ids);
    is_loading = false;
  }

  async function addPhoto() {
    is_loading = true;
    const photo = await Photos.addPhoto(CameraSource.Prompt);
    is_loading = false;

    if (!photo) return;

    if (!photo_ids) photo_ids = [];
    photo_ids = [...photo_ids, photo.id];
    photos = [...photos, photo];
  }

  /**
   * @param {string} photo_id
   */
  async function removePhoto(photo_id) {
    const confirmed = await Alert.confirm({
      title: t("delete_photo"),
      message: t("delete_photo_confirm"),
      confirmText: t("delete"),
      cancelText: t("cancel"),
    });

    if (!confirmed) return;

    // Remove from array
    photo_ids = photo_ids?.filter((id) => id !== photo_id) || [];
    photos = photos.filter((p) => p.id !== photo_id);

    // Delete the file
    await Photos.deletePhoto(photo_id);
  }

  /**
   * Open photo in full screen
   * @param {TaskPhoto} photo
   */
  function viewPhoto(photo) {
    // Create a simple full-screen modal
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm";
    overlay.onclick = () => overlay.remove();

    const img = document.createElement("img");
    img.src = photo.webview_path || "";
    img.className = "max-w-full max-h-full object-contain";
    img.onclick = (e) => e.stopPropagation();

    const close_button = document.createElement("button");
    close_button.innerHTML = "✕";
    close_button.className =
      "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center";
    close_button.onclick = () => overlay.remove();

    overlay.appendChild(img);
    overlay.appendChild(close_button);
    document.body.appendChild(overlay);
  }
</script>

<div>
  <!-- Add Photo Button -->
  <button
    onclick={addPhoto}
    disabled={is_loading}
    class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
  >
    <Camera />
    <span>{is_loading ? t("loading") : t("add_photo")}</span>
  </button>

  <!-- Photos Grid -->
  {#if !!photos.length}
    <div class="grid grid-cols-3 gap-2 mt-4">
      {#each photos as photo (photo.id)}
        <div class="relative group aspect-square">
          <button
            onclick={() => viewPhoto(photo)}
            class="w-full h-full rounded-lg overflow-hidden bg-card border border-line"
          >
            <img src={photo.webview_path} alt="Attachment" class="w-full h-full object-cover" />
          </button>

          <!-- Delete button -->
          <button
            onclick={() => removePhoto(photo.id)}
            class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={t("delete_photo")}
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

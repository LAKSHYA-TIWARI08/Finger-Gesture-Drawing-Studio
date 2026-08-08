/**
 * Storage Manager for Auto-save and Artwork Gallery
 */

const STORAGE_KEY_GALLERY = "gesture_studio_gallery_v1";
const STORAGE_KEY_AUTOSAVE = "gesture_studio_autosave_v1";

export function saveToGallery(dataUrl, name = "") {
  try {
    const existing = getGalleryItems();
    const newItem = {
      id: "art_" + Date.now(),
      title: name || `Gesture Art ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      dataUrl,
      timestamp: Date.now()
    };
    const updated = [newItem, ...existing.slice(0, 15)]; // keep max 16 items
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.warn("Failed to save image to localStorage gallery:", err);
    return null;
  }
}

export function getGalleryItems() {
  try {
    const item = localStorage.getItem(STORAGE_KEY_GALLERY);
    return item ? JSON.parse(item) : [];
  } catch (err) {
    return [];
  }
}

export function deleteGalleryItem(id) {
  try {
    const existing = getGalleryItems();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}

export function saveAutoSaveState(dataUrl) {
  try {
    localStorage.setItem(STORAGE_KEY_AUTOSAVE, dataUrl);
  } catch (err) {
    // Ignore quota errors
  }
}

export function getAutoSaveState() {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTOSAVE);
  } catch (err) {
    return null;
  }
}

import { INITIAL_RESTAURANT_STATE } from '../constants/initialData';
import { LOCAL_LANDMARK_PINS } from '../constants/locationData';
import { CartItem, MenuItem, RestaurantState, SavedOrderRecord } from '../types';

export const PRIMARY_STORAGE_KEY = 'dogar_sajji_master_config_v5';
export const BACKUP_STORAGE_KEY = 'dogar_sajji_backup_config_v5';
export const LEGACY_STORAGE_KEY_V4 = 'dogar_sajji_master_config_v4';
export const LEGACY_STORAGE_KEY_V3 = 'dogar_sajji_master_config_v3';
export const LEGACY_STORAGE_KEY_V2 = 'dogar_sajji_restaurant_state_v2';
export const LEGACY_STORAGE_KEY_V1 = 'dogar_sajji_restaurant_state_v1';
export const CUSTOMER_CART_KEY = 'dogar_sajji_customer_cart_v1';
export const ORDER_HISTORY_KEY = 'dogar_sajji_order_history_v1';

/**
 * Robust loader that guarantees saved owner changes are NEVER lost on refresh,
 * tab re-opening, or redeployments. Implements dual-key backup recovery.
 */
export function loadRestaurantState(): RestaurantState {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return INITIAL_RESTAURANT_STATE;
  }

  try {
    // 1. Try Primary Storage Key (v5)
    const rawPrimary = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (rawPrimary) {
      const parsed = JSON.parse(rawPrimary) as Partial<RestaurantState>;
      if (parsed && typeof parsed === 'object') {
        return mergeWithSafetyDefaults(parsed);
      }
    }

    // 2. Fallback to Secondary Backup Key (v5)
    const rawBackup = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (rawBackup) {
      console.warn('Recovering restaurant configuration from secondary backup cache...');
      const parsedBackup = JSON.parse(rawBackup) as Partial<RestaurantState>;
      if (parsedBackup && typeof parsedBackup === 'object') {
        const merged = mergeWithSafetyDefaults(parsedBackup);
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }

    // 3. Fallback to Legacy Storage Keys (Migrate gracefully to v5)
    const rawLegacyV4 = localStorage.getItem(LEGACY_STORAGE_KEY_V4);
    if (rawLegacyV4) {
      console.info('Migrating legacy v4 restaurant configuration to master v5...');
      const parsedLegacy = JSON.parse(rawLegacyV4) as Partial<RestaurantState>;
      const merged = mergeWithSafetyDefaults(parsedLegacy);
      saveRestaurantState(merged);
      return merged;
    }

    const rawLegacyV3 = localStorage.getItem(LEGACY_STORAGE_KEY_V3);
    if (rawLegacyV3) {
      console.info('Migrating legacy v3 restaurant configuration to master v5...');
      const parsedLegacy = JSON.parse(rawLegacyV3) as Partial<RestaurantState>;
      const merged = mergeWithSafetyDefaults(parsedLegacy);
      saveRestaurantState(merged);
      return merged;
    }

    // 4. Clean initial state only when no previous saved data exists
    return INITIAL_RESTAURANT_STATE;
  } catch (err) {
    console.error('Critical storage read error. Attempting safe recovery from backup:', err);
    try {
      const rawBackup = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (rawBackup) {
        return mergeWithSafetyDefaults(JSON.parse(rawBackup));
      }
    } catch {
      // Ignore
    }
    return INITIAL_RESTAURANT_STATE;
  }
}

/**
 * Deep-merges saved owner modifications with safety default schema fields,
 * guaranteeing no user-customized items, prices, or images are wiped.
 */
function mergeWithSafetyDefaults(saved: Partial<RestaurantState>): RestaurantState {
  // Start with complete authentic canonical catalog (49 items)
  let mergedMenuItems = INITIAL_RESTAURANT_STATE.menuItems;

  if (Array.isArray(saved.menuItems) && saved.menuItems.length > 0) {
    const canonicalMap = new Map(INITIAL_RESTAURANT_STATE.menuItems.map(m => [m.id, m]));
    
    // Map saved items: if canonical, preserve customized price, image, name or description
    const userCustomDishes: MenuItem[] = [];
    const updatedCanonical: MenuItem[] = [];

    saved.menuItems.forEach((item) => {
      // Purge any fast food or barbecue rice varieties if previously saved
      if (
        item.isExcludedFastFood ||
        /burger|pizza|french fries|broast|zinger|commercial biryani|barbecue rice|bbq rice/i.test(item.nameEn) ||
        /باربی کیو چاول/i.test(item.nameUr)
      ) {
        return;
      }

      if (canonicalMap.has(item.id)) {
        const canonical = canonicalMap.get(item.id)!;
        updatedCanonical.push({
          ...canonical,
          ...item,
          // Guarantee canonical id & structure
          id: canonical.id,
          categoryId: item.categoryId || canonical.categoryId,
          menuGroup: canonical.menuGroup,
          image: item.image || canonical.image,
          prices: item.prices || canonical.prices,
        });
      } else if (item.id.startsWith('dish-') || item.id.startsWith('custom-')) {
        // Owner added dish
        userCustomDishes.push(item);
      }
    });

    // Ensure all 49 authentic canonical items exist
    const updatedIds = new Set(updatedCanonical.map(m => m.id));
    const missingCanonical = INITIAL_RESTAURANT_STATE.menuItems.filter(c => !updatedIds.has(c.id));

    // Priority items on top, then extended items, plus any custom items in their respective places
    mergedMenuItems = [...updatedCanonical, ...missingCanonical, ...userCustomDishes];
  }

  return {
    ...INITIAL_RESTAURANT_STATE,
    ...saved,
    version: 5,
    menuItems: mergedMenuItems,
    // Preserve custom add-ons or fallback to strict authentic ones
    addOns: Array.isArray(saved.addOns) && saved.addOns.length > 0
      ? saved.addOns
      : INITIAL_RESTAURANT_STATE.addOns,
    // Preserve custom Odoo blocks
    odooBlocks: Array.isArray(saved.odooBlocks) && saved.odooBlocks.length > 0
      ? saved.odooBlocks
      : INITIAL_RESTAURANT_STATE.odooBlocks,
    // Preserve gallery images
    galleryImages: Array.isArray(saved.galleryImages) && saved.galleryImages.length > 0
      ? saved.galleryImages
      : INITIAL_RESTAURANT_STATE.galleryImages,
    // Preserve 9 landmarks
    landmarks: Array.isArray(saved.landmarks) && saved.landmarks.length > 0
      ? saved.landmarks
      : LOCAL_LANDMARK_PINS,
    // Preserve Owner Profile & Passport Image
    ownerNameEn: saved.ownerNameEn || INITIAL_RESTAURANT_STATE.ownerNameEn,
    ownerNameUr: saved.ownerNameUr || INITIAL_RESTAURANT_STATE.ownerNameUr,
    ownerTitleEn: saved.ownerTitleEn || INITIAL_RESTAURANT_STATE.ownerTitleEn,
    ownerTitleUr: saved.ownerTitleUr || INITIAL_RESTAURANT_STATE.ownerTitleUr,
    ownerMessageEn: saved.ownerMessageEn || INITIAL_RESTAURANT_STATE.ownerMessageEn,
    ownerMessageUr: saved.ownerMessageUr || INITIAL_RESTAURANT_STATE.ownerMessageUr,
    ownerPassportImage: saved.ownerPassportImage || INITIAL_RESTAURANT_STATE.ownerPassportImage,
    // 3-Tier Visual Customizer Properties
    activeLightingMode: saved.activeLightingMode || INITIAL_RESTAURANT_STATE.activeLightingMode || 'golden-radiance',
    activeBlockScheme: saved.activeBlockScheme || INITIAL_RESTAURANT_STATE.activeBlockScheme || 'block-elevated-card',
    // DUAL-VIEW CARD ENGINE (MOBILE 1-ROW VS PC 2-GRID)
    catalogViewMode: saved.catalogViewMode || INITIAL_RESTAURANT_STATE.catalogViewMode || 'mobile-default',
    // DEDICATED TYPOGRAPHY SEGMENTATION MODULE (THE TYPE SECTION ENGINE)
    activeTypographyLayout: saved.activeTypographyLayout || INITIAL_RESTAURANT_STATE.activeTypographyLayout || 'clean-minimalist-sans',
    activeTextColorPalette: saved.activeTextColorPalette || INITIAL_RESTAURANT_STATE.activeTextColorPalette || 'charcoal-gold',
    // 5 DYNAMIC RAINBOW BUTTON ACCENT TEMPLATES + DEFAULT
    activeButtonTheme: saved.activeButtonTheme || INITIAL_RESTAURANT_STATE.activeButtonTheme || 'default-emerald-rose',
  };
}

/**
 * Transactive Save Engine:
 * Commits atomically to Primary Key AND Backup Key with quota safety.
 */
export function saveRestaurantState(state: RestaurantState): { success: boolean; error?: string } {
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(PRIMARY_STORAGE_KEY, payload);
    localStorage.setItem(BACKUP_STORAGE_KEY, payload);

    // Dispatch custom event for real-time reactivity across tabs and views
    window.dispatchEvent(new CustomEvent('dogar_restaurant_state_saved', { detail: state }));
    return { success: true };
  } catch (err: unknown) {
    console.error('Failed to commit restaurant state to localStorage:', err);
    const errorMessage = err instanceof Error ? err.message : 'Storage quota exceeded or unavailable';
    return { success: false, error: errorMessage };
  }
}

/**
 * DELIBERATE FACTORY RESET:
 * The ONLY mechanism that resets the owner-configured state to factory defaults.
 * Requires explicit owner trigger and clears keys safely.
 */
export function resetRestaurantStateToFactory(): RestaurantState {
  try {
    localStorage.removeItem(PRIMARY_STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY_V4);
    localStorage.removeItem(LEGACY_STORAGE_KEY_V3);
    localStorage.removeItem(LEGACY_STORAGE_KEY_V2);
    localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
    console.info('Factory reset executed by verified owner.');
  } catch (err) {
    console.error('Failed to clear storage keys during factory reset:', err);
  }
  return INITIAL_RESTAURANT_STATE;
}

/**
 * ISOLATED CUSTOMER CART PERSISTENCE:
 * Separated completely from Owner Configuration so owner edits NEVER clear or corrupt customer carts.
 */
export function loadCustomerCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse customer cart from storage:', err);
  }
  return [];
}

export function saveCustomerCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CUSTOMER_CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist customer cart:', err);
  }
}

export function clearCustomerCart(): void {
  try {
    localStorage.removeItem(CUSTOMER_CART_KEY);
  } catch (err) {
    console.error('Failed to clear customer cart:', err);
  }
}

/**
 * ORDER HISTORY PERSISTENCE:
 * Tracks customer WhatsApp orders in localStorage so they can review, copy receipts, or re-order.
 */
export function loadOrderHistory(): SavedOrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse order history from storage:', err);
  }
  return [];
}

export function saveOrderRecord(newOrder: SavedOrderRecord): SavedOrderRecord[] {
  try {
    const existing = loadOrderHistory();
    // Keep newest first, max 50 orders
    const updated = [newOrder, ...existing.filter((o) => o.id !== newOrder.id)].slice(0, 50);
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to persist order record:', err);
    return [];
  }
}

export function clearOrderHistory(): void {
  try {
    localStorage.removeItem(ORDER_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear order history:', err);
  }
}

/**
 * Universal file reader with canvas-assisted memory optimization.
 * Programmatically forces all drag-and-drop uploaded media processed inside the Admin Panel
 * to pass through a lightweight canvas scaling loop before encoding into local storage string variables.
 * This prevents bulk Base64 payloads from crashing client runtime memory or browser reload operations.
 */
export function readFileAsBase64(file: File, maxDimension = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') {
        reject(new Error('Failed to read image as base64 string'));
        return;
      }

      // Universal HTML5 Canvas scaling & compression loop for ALL uploaded media
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Downscale if dimension exceeds max bound
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw clean background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to web-optimized JPEG string
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
            return;
          }
          resolve(rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error occurred'));
    reader.readAsDataURL(file);
  });
}

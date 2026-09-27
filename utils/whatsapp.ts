import { CartItem } from '../types';

export interface CustomerOrderMeta {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  orderType: 'delivery' | 'takeaway' | 'dinein';
  deliveryRadius?: 'within-5km' | 'beyond-5km'; // 5 KM Radius metric logic
  nearestLandmark?: string; // One of the 9 local pins
  tableNumber?: string;
  specialInstructions?: string;
}

export function formatWhatsAppOrderMessage(
  restaurantNameEn: string,
  restaurantNameUr: string,
  hotlineFormatted: string,
  items: CartItem[],
  customer: CustomerOrderMeta,
  defaultDeliveryFee: number = 0
): string {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  let itemsSubtotal = 0;
  const itemLines: string[] = [];

  items.forEach((item, index) => {
    const itemBaseTotal = item.unitPrice * item.quantity;
    let addOnsTotal = 0;
    const addOnLines: string[] = [];

    item.selectedAddOns.forEach((addon) => {
      const addonCost = addon.price * addon.quantity;
      addOnsTotal += addonCost;
      addOnLines.push(`    ↳ + ${addon.quantity}x ${addon.nameEn} (${addon.nameUr}) - Rs. ${addonCost}`);
    });

    const itemCombinedTotal = itemBaseTotal + addOnsTotal;
    itemsSubtotal += itemCombinedTotal;

    const portionLabel = item.portion === 'full' ? 'Full / فل' : item.portion === 'half' ? 'Half / ہاف' : 'Single / سنگل';

    let itemBlock = `${index + 1}. *${item.quantity}x ${item.nameEn} (${item.nameUr})* [${portionLabel}] — Rs. ${itemBaseTotal}`;
    if (addOnLines.length > 0) {
      itemBlock += '\n' + addOnLines.join('\n');
    }
    if (item.specialInstructions && item.specialInstructions.trim()) {
      itemBlock += `\n    📝 Note: "${item.specialInstructions.trim()}"`;
    }
    itemLines.push(itemBlock);
  });

  // Calculate delivery fee based on 5KM Radius metric
  let effectiveDeliveryFee = 0;
  if (customer.orderType === 'delivery') {
    if (customer.deliveryRadius === 'beyond-5km') {
      effectiveDeliveryFee = 150;
    } else {
      // Within 5KM Radius: Free Delivery (Rs. 0)
      effectiveDeliveryFee = 0;
    }
  }

  const finalNetTotal = itemsSubtotal + effectiveDeliveryFee;

  const orderTypeDisplay = 
    customer.orderType === 'delivery' 
      ? 'Home Delivery / ہوم ڈلیوری' 
      : customer.orderType === 'takeaway' 
        ? 'Takeaway / ٹیک اوے' 
        : `Dine-in / ڈائن ان (Table ${customer.tableNumber || 'N/A'})`;

  const deliveryRadiusDisplay = 
    customer.deliveryRadius === 'within-5km'
      ? '✅ Within 5 KM Zone (FREE DELIVERY / مفت ڈلیوری)'
      : customer.deliveryRadius === 'beyond-5km'
        ? '🛵 Beyond 5 KM Zone (Standard Delivery: Rs. 150)'
        : 'Within 5 KM Zone (Free Delivery / مفت ڈلیوری)';

  const lines = [
    `🔥 *${restaurantNameEn.toUpperCase()}*`,
    `✨ *${restaurantNameUr}*`,
    `📞 Hotline: ${hotlineFormatted}`,
    `🕒 ${dateString} at ${timeString}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🍽️ *ORDER SUMMARY / آرڈر کی تفصیل:*`,
    itemLines.join('\n\n'),
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Items Subtotal:* Rs. ${itemsSubtotal.toLocaleString()}`,
    customer.orderType === 'delivery'
      ? effectiveDeliveryFee === 0
        ? `🎁 *Delivery Fee (Within 5KM Radius):* FREE (Rs. 0)`
        : `🛵 *Delivery Fee (Beyond 5KM):* Rs. ${effectiveDeliveryFee.toLocaleString()}`
      : `📦 *Order Mode:* ${orderTypeDisplay}`,
    `💳 *NET SUM / کل رقم:* *Rs. ${finalNetTotal.toLocaleString()}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📍 *LOCATION & RADIUS METRICS:*`,
    customer.orderType === 'delivery' ? `• Radius Check: ${deliveryRadiusDisplay}` : null,
    customer.nearestLandmark ? `• Landmark Pin: ${customer.nearestLandmark}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *CUSTOMER DETAILS / گاہک کی تفصیل:*`,
    `• Name / نام: ${customer.customerName.trim() || 'Valued Customer / معزز گاہک'}`,
    `• Contact / رابطہ نمبر: ${customer.phone.trim() || 'Direct WhatsApp'}`,
    customer.orderType === 'delivery' 
      ? `• Delivery Address / پتہ: ${customer.deliveryAddress.trim() || 'Please confirm on WhatsApp'}` 
      : `• Service: ${orderTypeDisplay}`,
    customer.specialInstructions && customer.specialInstructions.trim() 
      ? `• Instructions / ہدایات: ${customer.specialInstructions.trim()}` 
      : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Please confirm preparation time & dispatch receipt. شکریہ!*`
  ].filter(Boolean);

  return lines.join('\n');
}

export function cleanPhoneNumber(whatsappNumber: string): string {
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('03')) {
    cleanNumber = '92' + cleanNumber.slice(1);
  }
  if (!cleanNumber.startsWith('92') && cleanNumber.length === 10) {
    cleanNumber = '92' + cleanNumber;
  }
  return cleanNumber || '923009346628';
}

/**
 * Native Mobile Deep-Link Protocol Generator
 * Programmatically forces instant native WhatsApp opening without browser redirect delays.
 */
export function buildWhatsAppDeepLink(whatsappNumber: string, message: string): string {
  const cleanNumber = cleanPhoneNumber(whatsappNumber);
  const encodedMessage = encodeURIComponent(message);
  return `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
}

export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  const cleanNumber = cleanPhoneNumber(whatsappNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * DIRECT PROTOCOL INJECTION & SECONDARY HEADLESS CLIPBOARD TRANSACTION HOOK:
 * 1. Automatically copies the entire line-broken itemized bill receipt string onto the user's
 *    mobile clipboard storage in the background for manual redundancy.
 * 2. Programmatically forces calling the native mobile deep-link protocol ('whatsapp://send?phone=...').
 * 3. Includes automatic desktop browser fallback if protocol is not registered on the system.
 */
export function openNativeWhatsApp(whatsappNumber: string, message: string): void {
  // CLIPBOARD RECEIPT AUTO-COPY PIPELINE (Background Headless Transaction Hook)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {
        // Fallback for strict mobile iframe permissions
        try {
          const textarea = document.createElement('textarea');
          textarea.value = message;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          textarea.style.pointerEvents = 'none';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          // Silent fallback
        }
      });
    }
  } catch {
    // Fail gracefully
  }

  const deepLink = buildWhatsAppDeepLink(whatsappNumber, message);
  const webFallback = buildWhatsAppLink(whatsappNumber, message);

  try {
    // 1. Direct native mobile protocol execution
    window.location.href = deepLink;

    // 2. Resilient fallback for desktop browsers or devices where deep-link doesn't steal focus
    setTimeout(() => {
      if (typeof document !== 'undefined' && document.hasFocus()) {
        window.open(webFallback, '_blank');
      }
    }, 850);
  } catch {
    window.open(webFallback, '_blank');
  }
}

/**
 * Standard Item Order Receipt Script Pre-fill (Exact Specification):
 * "Dear Dogar Sajji, I want to order [Item Name] ([Full/Half Size]) x [Qty] + Side [Drink Choice if chosen]. Total Bill: Rs. [Sum]."
 * Includes explicit itemized parameters, unit prices, and row subtotals.
 */
export function formatStandardItemReceipt(
  itemName: string,
  portion: string,
  quantity: number,
  sidesList: string,
  totalBill: number,
  unitPrice?: number,
  sidesBreakdown?: { name: string; quantity: number; unitPrice: number; subtotal: number }[]
): string {
  const portionFormatted = portion.toLowerCase().includes('half') ? 'Half' : 'Full';
  const sideString = sidesList && sidesList.trim() ? ` + Side ${sidesList.trim()}` : '';

  if (!sidesBreakdown || sidesBreakdown.length === 0) {
    return `Dear Dogar Sajji, I want to order ${itemName} (${portionFormatted}) x ${quantity}${sideString}. Total Bill: Rs. ${totalBill.toLocaleString()}.`;
  }

  const itemSubtotal = unitPrice ? unitPrice * quantity : 0;
  const lines: string[] = [
    `Dear Dogar Sajji, I want to order:`,
    `- Item: ${itemName} [${portionFormatted} Portion] x ${quantity}${itemSubtotal > 0 ? ` (Subtotal: Rs. ${itemSubtotal.toLocaleString()})` : ''}`,
    `- Sides / Add-ons:`,
    ...sidesBreakdown.map((s) => `  * ${s.quantity}x ${s.name} @ Rs. ${s.unitPrice} = Rs. ${s.subtotal.toLocaleString()}`),
    `---------------------------------------`,
    `Total Bill: Rs. ${totalBill.toLocaleString()}`,
    `Hotline: 0300-9346628 / 0301-8179528`,
  ];
  return lines.join('\n');
}

/**
 * Custom Built Order Receipt Script Pre-fill (Exact Specification):
 * "🔥 CUSTOM BUILT ORDER: \n- Protein: [Selection] \n- Cooking Style: [Selection] \n- Portion: [Full/Half] \n- Add-ons: [Naan/Raita/Drinks List] \n-----------------------\nTotal Amount Payable: Rs. [Calculated Sum]."
 * Includes explicit row tracking for every selected parameter: Portions selected, exact item names, side drink quantities, row subtotals, and aggregated net total amount payable.
 */
export function formatCustomBuiltOrderReceipt(
  protein: string,
  cookingStyle: string,
  portion: string,
  addOnsList: string,
  totalAmount: number,
  basePrice?: number,
  sidesBreakdown?: { name: string; quantity: number; unitPrice: number; subtotal: number }[]
): string {
  const lines: string[] = [
    `🔥 CUSTOM BUILT ORDER:`,
    `- Protein: ${protein}`,
    `- Cooking Style: ${cookingStyle}`,
    `- Portion: ${portion}${basePrice ? ` (Base Subtotal: Rs. ${basePrice.toLocaleString()})` : ''}`,
  ];

  if (sidesBreakdown && sidesBreakdown.length > 0) {
    lines.push(`- Add-ons & Sides (Itemized Subtotals):`);
    sidesBreakdown.forEach((s) => {
      lines.push(`  * ${s.quantity}x ${s.name} @ Rs. ${s.unitPrice} = Rs. ${s.subtotal.toLocaleString()}`);
    });
    const sidesSubtotal = sidesBreakdown.reduce((acc, s) => acc + s.subtotal, 0);
    lines.push(`  ↳ Sides Subtotal: Rs. ${sidesSubtotal.toLocaleString()}`);
  } else {
    lines.push(`- Add-ons: ${addOnsList || 'None'}`);
  }

  lines.push(`-----------------------`);
  lines.push(`Total Amount Payable: Rs. ${totalAmount.toLocaleString()}`);
  lines.push(`Hotline: 0300-9346628 / 0301-8179528`);
  return lines.join('\n');
}

export function openWhatsAppSafely(url: string) {
  // If URL is a whatsapp:// scheme, invoke native protocol directly
  if (url.startsWith('whatsapp://')) {
    window.location.href = url;
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

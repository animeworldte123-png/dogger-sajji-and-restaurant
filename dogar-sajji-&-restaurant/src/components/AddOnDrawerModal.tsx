import React, { useState } from 'react';
import { X, Plus, Minus, Send, ShoppingBag, Check, Bike, MapPin } from 'lucide-react';
import { AddOnOption, CartAddOnItem, CartItem, MenuItem, ThemeStyleConfig } from '../types';
import { 
  buildWhatsAppLink, 
  formatStandardItemReceipt, 
  formatWhatsAppOrderMessage, 
  openNativeWhatsApp, 
  openWhatsAppSafely 
} from '../utils/whatsapp';
import { LOCAL_LANDMARK_PINS } from '../constants/locationData';

interface AddOnDrawerModalProps {
  item: MenuItem | null;
  initialPortion: 'full' | 'half';
  addOns: AddOnOption[];
  theme: ThemeStyleConfig;
  hotlineFormatted: string;
  hotlineWhatsappRaw: string;
  restaurantNameEn: string;
  restaurantNameUr: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const AddOnDrawerModal: React.FC<AddOnDrawerModalProps> = ({
  item,
  initialPortion,
  addOns,
  theme,
  hotlineFormatted,
  hotlineWhatsappRaw,
  restaurantNameEn,
  restaurantNameUr,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !item) return null;

  const [portion, setPortion] = useState<'full' | 'half'>(initialPortion);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddOnCounts, setSelectedAddOnCounts] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [deliveryRadius, setDeliveryRadius] = useState<'within-5km' | 'beyond-5km'>('within-5km');
  const [nearestLandmark, setNearestLandmark] = useState<string>('Main Sarak / Kasur Road');

  const unitPrice = item.hasPortions
    ? (portion === 'half' && item.prices.half !== undefined ? item.prices.half : item.prices.full)
    : item.prices.full;

  const handleToggleAddOn = (addonId: string) => {
    setSelectedAddOnCounts((prev) => {
      const current = prev[addonId] || 0;
      return {
        ...prev,
        [addonId]: current > 0 ? 0 : 1,
      };
    });
  };

  const handleIncrementAddOn = (addonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAddOnCounts((prev) => ({
      ...prev,
      [addonId]: (prev[addonId] || 0) + 1,
    }));
  };

  const handleDecrementAddOn = (addonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAddOnCounts((prev) => {
      const current = prev[addonId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return {
        ...prev,
        [addonId]: current - 1,
      };
    });
  };

  // Compile active add-ons
  const compiledAddOns: CartAddOnItem[] = Object.entries(selectedAddOnCounts)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const option = addOns.find((a) => a.id === id);
      return {
        addOnId: id,
        nameEn: option ? option.nameEn : id,
        nameUr: option ? option.nameUr : '',
        price: option ? option.price : 0,
        quantity: count,
      };
    });

  const addOnsTotal = compiledAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const currentItemTotal = (unitPrice * quantity) + addOnsTotal;

  const buildCartItemObject = (): CartItem => ({
    id: `${item.id}-${portion}-${Date.now()}`,
    menuItemId: item.id,
    nameEn: item.nameEn,
    nameUr: item.nameUr,
    portion: item.hasPortions ? portion : 'single',
    unitPrice: unitPrice,
    quantity: quantity,
    selectedAddOns: compiledAddOns,
    specialInstructions: specialInstructions.trim() || undefined,
  });

  const handleAddAndClose = () => {
    onAddToCart(buildCartItemObject());
    onClose();
  };

  // Delivery fee logic for 5 KM radius metric
  const deliveryFee = deliveryRadius === 'within-5km' ? 0 : 150;
  const netOrderTotal = currentItemTotal + deliveryFee;

  // Instant direct WhatsApp pipeline checkout
  const handleInstantWhatsAppCheckout = () => {
    const sidesText = compiledAddOns.map((a) => `${a.quantity}x ${a.nameEn}`).join(', ');
    const standardMessage = formatStandardItemReceipt(
      item.nameEn,
      portion === 'full' ? 'Full Size' : 'Half Size',
      quantity,
      sidesText,
      netOrderTotal
    );

    // Force native mobile deep-link protocol ('whatsapp://send?phone=...&text=...')
    openNativeWhatsApp(hotlineWhatsappRaw, standardMessage);
    onClose();
  };

  const drinkOptions = addOns.filter((a) => a.category === 'drinks');
  const sideOptions = addOns.filter((a) => a.category === 'sides');
  const breadOptions = addOns.filter((a) => a.category === 'bread');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Box */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          borderColor: theme.borderStrong,
          color: theme.textPrimary,
        }}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header Bar */}
        <div
          style={{ borderColor: theme.borderSubtle }}
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        >
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 block">
              Custom Add-ons & Bulk Order
            </span>
            <h2 className="text-lg font-bold tracking-tight">{item.nameEn}</h2>
            <p className="text-xs font-urdu text-amber-500 font-semibold" dir="rtl">
              {item.nameUr}
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{ backgroundColor: theme.bgSurface, color: theme.textSecondary }}
            className="p-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Item Summary & Portion Switcher */}
          <div
            style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
            className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <img
                src={item.image}
                alt={item.nameEn}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div>
                <p className="text-xs text-slate-500">Base Serving / سائز منتخب کریں</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-semibold text-amber-600">Rs.</span>
                  <span className="text-lg font-extrabold tabular-nums">{unitPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Portion switcher */}
            {item.hasPortions && item.prices.half !== undefined && (
              <div
                style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
                className="inline-flex p-1 rounded-xl border w-full sm:w-auto justify-center"
              >
                <button
                  type="button"
                  onClick={() => setPortion('full')}
                  style={{
                    backgroundColor: portion === 'full' ? theme.accent : 'transparent',
                    color: portion === 'full' ? theme.accentText : theme.textSecondary,
                  }}
                  className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Full Size</span>
                  <span className="font-urdu text-[11px]">فل سائز</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPortion('half')}
                  style={{
                    backgroundColor: portion === 'half' ? theme.accent : 'transparent',
                    color: portion === 'half' ? theme.accentText : theme.textSecondary,
                  }}
                  className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Half Size</span>
                  <span className="font-urdu text-[11px]">ہاف سائز</span>
                </button>
              </div>
            )}

            {/* Dish Quantity Stepper */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:opacity-75 transition-opacity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-sm tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                style={{ backgroundColor: theme.accent, color: theme.accentText }}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 1: Cold Drinks */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold tracking-tight">
                🥤 Cold Drinks / کولڈ ڈرنکس
              </h3>
              <span style={{ color: theme.textMuted }} className="text-[11px]">
                Add chilled beverages to order
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {drinkOptions.map((drink) => {
                const count = selectedAddOnCounts[drink.id] || 0;
                const isSelected = count > 0;

                return (
                  <div
                    key={drink.id}
                    onClick={() => handleToggleAddOn(drink.id)}
                    style={{
                      backgroundColor: isSelected ? theme.bgSurfaceHover : theme.bgSurface,
                      borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'ring-1 ring-amber-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        style={{
                          backgroundColor: isSelected ? theme.accent : 'transparent',
                          borderColor: isSelected ? theme.accent : theme.borderStrong,
                        }}
                        className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{drink.nameEn}</p>
                        <p className="text-[10px] font-urdu text-amber-600 truncate">{drink.nameUr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-bold tabular-nums">Rs. {drink.price}</span>
                      {isSelected && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-md p-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDecrementAddOn(drink.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-black/10 hover:bg-black/20 text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{count}</span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrementAddOn(drink.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-amber-500 text-white text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Special Sauces & Fresh Raita */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold tracking-tight">
                🥗 Sauces & Raita / خاص سجی زیرہ رائتہ و سلاد
              </h3>
              <span style={{ color: theme.textMuted }} className="text-[11px]">
                Fresh extras for complete feast
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sideOptions.map((side) => {
                const count = selectedAddOnCounts[side.id] || 0;
                const isSelected = count > 0;

                return (
                  <div
                    key={side.id}
                    onClick={() => handleToggleAddOn(side.id)}
                    style={{
                      backgroundColor: isSelected ? theme.bgSurfaceHover : theme.bgSurface,
                      borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'ring-1 ring-amber-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        style={{
                          backgroundColor: isSelected ? theme.accent : 'transparent',
                          borderColor: isSelected ? theme.accent : theme.borderStrong,
                        }}
                        className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{side.nameEn}</p>
                        <p className="text-[10px] font-urdu text-amber-600 truncate">{side.nameUr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-bold tabular-nums">Rs. {side.price}</span>
                      {isSelected && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-md p-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDecrementAddOn(side.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-black/10 hover:bg-black/20 text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{count}</span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrementAddOn(side.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-amber-500 text-white text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Fresh Tandoor Breads */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold tracking-tight">
                🫓 Fresh Tandoor Bread / تندوری نان و روٹی
              </h3>
              <span style={{ color: theme.textMuted }} className="text-[11px]">
                Hot from clay oven
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {breadOptions.map((bread) => {
                const count = selectedAddOnCounts[bread.id] || 0;
                const isSelected = count > 0;

                return (
                  <div
                    key={bread.id}
                    onClick={() => handleToggleAddOn(bread.id)}
                    style={{
                      backgroundColor: isSelected ? theme.bgSurfaceHover : theme.bgSurface,
                      borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'ring-1 ring-amber-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        style={{
                          backgroundColor: isSelected ? theme.accent : 'transparent',
                          borderColor: isSelected ? theme.accent : theme.borderStrong,
                        }}
                        className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0"
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{bread.nameEn}</p>
                        <p className="text-[10px] font-urdu text-amber-600 truncate">{bread.nameUr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-bold tabular-nums">Rs. {bread.price}</span>
                      {isSelected && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-md p-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDecrementAddOn(bread.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-black/10 hover:bg-black/20 text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{count}</span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrementAddOn(bread.id, e)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-amber-500 text-white text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Special Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Special Cooking Instructions / خاص ہدایات (کم مرچ، زیادہ لیموں وغیرہ)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra lemons and mint, well-roasted crispy skin..."
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Delivery Location & 5KM Radius Check */}
          <div
            style={{ backgroundColor: theme.bgSurface, borderColor: theme.borderSubtle }}
            className="p-3.5 rounded-2xl border space-y-3"
          >
            {/* Prominent Banner Badge */}
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 shrink-0 text-white animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  Free Delivery within a 5 KM Radius
                </span>
              </div>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white text-emerald-800">
                0 Rs FEE
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Distance Zone / ڈلیوری کا فاصلہ منتخب کریں (لازمی):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeliveryRadius('within-5km')}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    deliveryRadius === 'within-5km'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'border-slate-300/60 bg-white/5 text-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-[11px]">Within 5 KM</span>
                    <span className="text-[10px] text-emerald-600 font-urdu block">مفت ڈلیوری</span>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-600 text-white">
                    Rs. 0
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryRadius('beyond-5km')}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    deliveryRadius === 'beyond-5km'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/50'
                      : 'border-slate-300/60 bg-white/5 text-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-[11px]">Beyond 5 KM</span>
                    <span className="text-[10px] text-amber-600 font-urdu block">معیاری ڈلیوری</span>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-600 text-white">
                    + Rs. 150
                  </span>
                </button>
              </div>

              {/* Landmark Pin Dropdown */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nearest Landmark Pin / قریبی نشان:
                </label>
                <select
                  value={nearestLandmark}
                  onChange={(e) => setNearestLandmark(e.target.value)}
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderSubtle,
                    color: theme.textPrimary,
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-hidden"
                >
                  {LOCAL_LANDMARK_PINS.map((pin) => (
                    <option key={pin.id} value={`${pin.nameEn} (${pin.nameUr})`}>
                      {pin.nameEn} — {pin.nameUr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name / آپ کا نام"
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderSubtle,
                    color: theme.textPrimary,
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border focus:outline-hidden"
                />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street / House # / گلی یا مکان نمبر"
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderSubtle,
                    color: theme.textPrimary,
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Footer */}
        <div
          style={{
            backgroundColor: theme.bgSurface,
            borderColor: theme.borderSubtle,
          }}
          className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
        >
          <div>
            <span style={{ color: theme.textMuted }} className="text-[10px] block uppercase tracking-wider">
              Total Amount {deliveryFee > 0 ? `(Inc. Rs. ${deliveryFee} Delivery)` : '(Free 5KM Delivery)'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-amber-600">Rs.</span>
              <span className="text-2xl font-black tabular-nums">{netOrderTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Add to floating tray/cart */}
            <button
              type="button"
              onClick={handleAddAndClose}
              style={{
                backgroundColor: theme.bgCard,
                borderColor: theme.borderStrong,
                color: theme.textPrimary,
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold hover:opacity-85 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Add to Tray</span>
              <span className="font-urdu text-[11px]">ٹرے میں ڈالیں</span>
            </button>

            {/* Direct WhatsApp Pipeline Checkout */}
            <button
              type="button"
              onClick={handleInstantWhatsAppCheckout}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp Hotline</span>
              <span className="font-urdu text-[11px]">فوری واٹس ایپ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

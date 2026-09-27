import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, X, Plus, Minus, Trash2, Send, MapPin, Phone, User, Clock, 
  CheckCircle2, Bike, ShieldCheck, Compass, AlertCircle, History, Copy, 
  RotateCcw, Check, Calendar, ArrowRight
} from 'lucide-react';
import { CartItem, ThemeStyleConfig, SavedOrderRecord } from '../types';
import { 
  CustomerOrderMeta, 
  buildWhatsAppLink, 
  formatStandardItemReceipt, 
  formatWhatsAppOrderMessage, 
  openNativeWhatsApp, 
  openWhatsAppSafely 
} from '../utils/whatsapp';
import { LOCAL_LANDMARK_PINS } from '../constants/locationData';
import { loadOrderHistory, saveOrderRecord, clearOrderHistory } from '../utils/storage';

interface CartTrayDrawerProps {
  cartItems: CartItem[];
  theme: ThemeStyleConfig;
  hotlineFormatted: string;
  hotlineWhatsappRaw: string;
  restaurantNameEn: string;
  restaurantNameUr: string;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddToCart?: (item: CartItem) => void;
}

export const CartTrayDrawer: React.FC<CartTrayDrawerProps> = ({
  cartItems,
  theme,
  hotlineFormatted,
  hotlineWhatsappRaw,
  restaurantNameEn,
  restaurantNameUr,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isOpen,
  onOpen,
  onClose,
  onAddToCart,
}) => {
  // Drawer View Tab: 'current-tray' vs 'order-history'
  const [activeDrawerTab, setActiveDrawerTab] = useState<'current-tray' | 'order-history'>('current-tray');

  // Order History state synced with browser localStorage
  const [orderHistory, setOrderHistory] = useState<SavedOrderRecord[]>(() => loadOrderHistory());
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // Sync order history from storage on open
  useEffect(() => {
    if (isOpen) {
      setOrderHistory(loadOrderHistory());
    }
  }, [isOpen]);

  const [customerMeta, setCustomerMeta] = useState<CustomerOrderMeta>({
    customerName: '',
    phone: '',
    deliveryAddress: '',
    orderType: 'delivery',
    deliveryRadius: 'within-5km', // Default to 5 KM free delivery
    nearestLandmark: 'Main Sarak / Kasur Road',
    tableNumber: '',
    specialInstructions: '',
  });

  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const itemsSubtotal = cartItems.reduce((total, item) => {
    const base = item.unitPrice * item.quantity;
    const addons = item.selectedAddOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
    return total + base + addons;
  }, 0);

  // DYNAMIC LIVE DELIVERY ESTIMATOR:
  // Programmatically links an isolated algorithmic calculator array scaling cleanly with total ordered count
  const deliveryTimeEstimate = useMemo(() => {
    if (totalItemsCount <= 2) {
      return { min: 25, max: 35 };
    } else if (totalItemsCount <= 4) {
      return { min: 35, max: 45 };
    } else if (totalItemsCount <= 7) {
      return { min: 45, max: 55 };
    } else {
      return { min: 55, max: 65 };
    }
  }, [totalItemsCount]);

  // 5 KM RADIUS METRIC & CHECKOUT LOGIC:
  // Within 5 KM = Free Delivery (Rs. 0)
  // Beyond 5 KM = Rs. 150 standard delivery
  const deliveryFee = 
    customerMeta.orderType === 'delivery' 
      ? customerMeta.deliveryRadius === 'beyond-5km' 
        ? 150 
        : 0 
      : 0;

  const netTotal = itemsSubtotal + deliveryFee;

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    // Validate mandatory location check if delivery
    if (customerMeta.orderType === 'delivery' && !customerMeta.deliveryRadius) {
      setShowLocationError(true);
      return;
    }

    setShowLocationError(false);

    let message: string;
    if (cartItems.length === 1 && customerMeta.orderType === 'takeaway' && !customerMeta.customerName) {
      const single = cartItems[0];
      const sidesText = single.selectedAddOns.map((a) => `${a.quantity}x ${a.nameEn}`).join(', ');
      message = formatStandardItemReceipt(
        single.nameEn,
        single.portion === 'full' ? 'Full Size' : single.portion === 'half' ? 'Half Size' : 'Single',
        single.quantity,
        sidesText,
        netTotal
      );
    } else {
      message = formatWhatsAppOrderMessage(
        restaurantNameEn,
        restaurantNameUr,
        hotlineFormatted,
        cartItems,
        customerMeta,
        deliveryFee
      );
    }

    // PERSIST TO ORDER HISTORY IN BROWSER LOCALSTORAGE
    const newOrderRecord: SavedOrderRecord = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: `DS-${Math.floor(100000 + Math.random() * 900000)}`,
      dateFormatted: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      items: cartItems.map((item) => ({ ...item })),
      customerMeta: { ...customerMeta },
      itemsSubtotal,
      deliveryFee,
      netTotal,
      receiptMessage: message,
    };

    const updatedHistory = saveOrderRecord(newOrderRecord);
    setOrderHistory(updatedHistory);

    setOrderSentSuccess(true);

    // DIRECT PROTOCOL INJECTION & SECONDARY CLIPBOARD PIPELINE:
    // Programmatically force native mobile deep-link protocol ('whatsapp://send?phone=...&text=...')
    openNativeWhatsApp(hotlineWhatsappRaw, message);

    setTimeout(() => {
      setOrderSentSuccess(false);
    }, 4000);
  };

  // Re-order handler: populates cart tray from historical order
  const handleReorder = (order: SavedOrderRecord) => {
    if (onAddToCart) {
      order.items.forEach((item) => {
        const freshCartItem: CartItem = {
          ...item,
          id: `${item.menuItemId}-${item.portion}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        };
        onAddToCart(freshCartItem);
      });
      setReorderNotification(`Order #${order.orderNumber} loaded into tray!`);
      setActiveDrawerTab('current-tray');
      setTimeout(() => setReorderNotification(null), 3000);
    }
  };

  // Copy past order receipt
  const handleCopyReceipt = (order: SavedOrderRecord) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(order.receiptMessage).then(() => {
        setCopiedOrderId(order.id);
        setTimeout(() => setCopiedOrderId(null), 2500);
      }).catch(() => {
        setCopiedOrderId(order.id);
        setTimeout(() => setCopiedOrderId(null), 2500);
      });
    } else {
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Direct re-send past order on WhatsApp
  const handleResendWhatsApp = (order: SavedOrderRecord) => {
    openNativeWhatsApp(hotlineWhatsappRaw, order.receiptMessage);
  };

  // Clear past order history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your saved WhatsApp order history? / کیا آپ تمام آرڈر ہسٹری صاف کرنا چاہتے ہیں؟')) {
      clearOrderHistory();
      setOrderHistory([]);
    }
  };

  return (
    <>
      {/* Floating Bottom Mobile/Desktop Tray Pill when cart has items */}
      {cartItems.length > 0 && !isOpen && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            onClick={onOpen}
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
            className="p-3.5 rounded-2xl border shadow-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-sm">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full tabular-nums">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Dish' : 'Dishes'} in Tray
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-amber-400 font-semibold">Rs.</span>
                  <span className="text-base font-black tabular-nums">{itemsSubtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Send className="w-3.5 h-3.5" />
                <span>Checkout</span>
                <span className="font-urdu text-[11px]">آرڈر</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity duration-200">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />

          <div
            style={{
              backgroundColor: theme.bgCard,
              color: theme.textPrimary,
              borderColor: theme.borderStrong,
            }}
            className="relative w-full max-w-lg h-full flex flex-col border-l shadow-2xl z-10 animate-in slide-in-from-right duration-250 overflow-hidden"
          >
            {/* 1. Header */}
            <div
              style={{ borderColor: theme.borderSubtle }}
              className="p-4 border-b flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                  {activeDrawerTab === 'current-tray' ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <History className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">
                    {activeDrawerTab === 'current-tray'
                      ? 'Your Order Tray / آرڈر ٹرے'
                      : 'WhatsApp Order History / آرڈر ہسٹری'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct WhatsApp Pipeline (Hotline: {hotlineFormatted})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeDrawerTab === 'current-tray' && cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    title="Clear order tray / ٹرے خالی کریں"
                    className="p-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. DUAL-TABS SWITCHER: CURRENT TRAY vs. ORDER HISTORY */}
            <div
              style={{
                backgroundColor: theme.bgSurface,
                borderColor: theme.borderSubtle,
              }}
              className="p-2 border-b flex items-center gap-2 shrink-0 select-none"
            >
              <button
                type="button"
                onClick={() => setActiveDrawerTab('current-tray')}
                style={{
                  backgroundColor: activeDrawerTab === 'current-tray' ? theme.accent : 'transparent',
                  color: activeDrawerTab === 'current-tray' ? theme.accentText : theme.textSecondary,
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Current Tray / موجودہ ٹرے</span>
                {cartItems.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('order-history')}
                style={{
                  backgroundColor: activeDrawerTab === 'order-history' ? theme.accent : 'transparent',
                  color: activeDrawerTab === 'order-history' ? theme.accentText : theme.textSecondary,
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <History className="w-3.5 h-3.5" />
                <span>Order History / سابقہ آرڈرز</span>
                {orderHistory.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
                    {orderHistory.length}
                  </span>
                )}
              </button>
            </div>

            {/* Re-order success notification toast */}
            {reorderNotification && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reorderNotification}</span>
              </div>
            )}

            {/* 3. SCROLLABLE TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ============================================================== */}
              {/* TAB A: CURRENT TRAY VIEW */}
              {/* ============================================================== */}
              {activeDrawerTab === 'current-tray' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold">Your Tray is Empty / ٹرے خالی ہے</h3>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Choose from Balochi Sajji, Shinwari Karahi, Mutton Roasts or Tandoor Naan to place your order.
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={onClose}
                          style={{
                            backgroundColor: theme.accent,
                            color: theme.accentText,
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Browse Menu / مینو دیکھیں
                        </button>
                        {orderHistory.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveDrawerTab('order-history')}
                            style={{
                              backgroundColor: theme.bgSurface,
                              borderColor: theme.borderStrong,
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-amber-500" />
                            <span>View History ({orderHistory.length})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* PROMINENT BANNER BADGE: Free Delivery within 5 KM Radius */}
                      <div className="p-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3 shadow-sm border border-emerald-500">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Bike className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black uppercase tracking-wider">
                                Free Delivery within a 5 KM Radius
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-100 font-urdu" dir="rtl">
                              5 کلومیٹر کے دائرے میں بغیر کسی اضافی چارجز کے مفت ڈلیوری
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-emerald-800 shrink-0">
                          0 Rs FEE
                        </span>
                      </div>

                      {/* DYNAMIC LIVE DELIVERY ESTIMATOR TILE */}
                      <div
                        style={{
                          backgroundColor: theme.bgSurface,
                          borderColor: theme.borderSubtle,
                        }}
                        className="p-3 rounded-2xl border flex items-center justify-between gap-2.5 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block">
                              Estimated Prep & Delivery: {deliveryTimeEstimate.min}-{deliveryTimeEstimate.max} Mins
                            </span>
                            <span className="text-[10px] text-slate-400 font-urdu" dir="rtl">
                              تیاری اور ترسیل کا تخمینہ وقت
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">
                          {totalItemsCount} {totalItemsCount === 1 ? 'Dish' : 'Dishes'}
                        </span>
                      </div>

                      {/* Cart Items List */}
                      <div className="space-y-3">
                        {cartItems.map((cartItem) => {
                          const itemSubtotal = cartItem.unitPrice * cartItem.quantity;
                          const addonsSubtotal = cartItem.selectedAddOns.reduce(
                            (sum, a) => sum + a.price * a.quantity,
                            0
                          );

                          return (
                            <div
                              key={cartItem.id}
                              style={{
                                backgroundColor: theme.bgSurface,
                                borderColor: theme.borderSubtle,
                              }}
                              className="p-3.5 rounded-2xl border space-y-2.5 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-bold tracking-tight">{cartItem.nameEn}</h4>
                                  <p className="text-xs font-semibold font-urdu text-amber-500" dir="rtl">
                                    {cartItem.nameUr}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold uppercase tracking-wider">
                                      {cartItem.portion === 'full'
                                        ? 'Full Portion / فل'
                                        : cartItem.portion === 'half'
                                        ? 'Half Portion / ہاف'
                                        : 'Single Serving / سنگل'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                      Rs. {cartItem.unitPrice} each
                                    </span>
                                  </div>
                                </div>

                                {/* Quantity Stepper */}
                                <div className="flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl shrink-0 border border-white/5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(cartItem.id, cartItem.quantity - 1)
                                    }
                                    className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold tabular-nums">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUpdateQuantity(cartItem.id, cartItem.quantity + 1)
                                    }
                                    className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(cartItem.id)}
                                    className="w-6 h-6 rounded-lg text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors ml-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Selected Add-ons Pill List */}
                              {cartItem.selectedAddOns.length > 0 && (
                                <div className="pt-2 border-t border-dashed border-slate-700/50 space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Added Sides & Drinks / لوازمات:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {cartItem.selectedAddOns.map((addon) => (
                                      <span
                                        key={addon.addOnId}
                                        className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-white/5 flex items-center gap-1"
                                      >
                                        <span className="font-bold text-amber-400">{addon.quantity}x</span>
                                        <span>{addon.nameEn}</span>
                                        <span className="text-slate-400 font-mono">
                                          (+Rs. {addon.price * addon.quantity})
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Item Note if any */}
                              {cartItem.specialInstructions && (
                                <p className="text-[11px] text-slate-400 italic">
                                  Note: &quot;{cartItem.specialInstructions}&quot;
                                </p>
                              )}

                              {/* Row Subtotal */}
                              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-400">Dish Subtotal:</span>
                                <span className="font-bold tabular-nums text-white">
                                  Rs. {(itemSubtotal + addonsSubtotal).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Customer Order Configuration Box */}
                      <div
                        style={{
                          backgroundColor: theme.bgSurface,
                          borderColor: theme.borderSubtle,
                        }}
                        className="p-4 rounded-2xl border space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                            Delivery & Customer Details / آرڈر تفصیلات
                          </h3>
                        </div>

                        {/* Order Type Selector */}
                        <div className="grid grid-cols-3 gap-2">
                          {(['delivery', 'takeaway', 'dinein'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setCustomerMeta((prev) => ({ ...prev, orderType: type }))
                              }
                              style={{
                                backgroundColor:
                                  customerMeta.orderType === type
                                    ? theme.accent
                                    : theme.bgCard,
                                color:
                                  customerMeta.orderType === type
                                    ? theme.accentText
                                    : theme.textSecondary,
                                borderColor:
                                  customerMeta.orderType === type
                                    ? theme.accent
                                    : theme.borderStrong,
                              }}
                              className="py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer capitalize"
                            >
                              {type === 'delivery'
                                ? 'Home Delivery'
                                : type === 'takeaway'
                                ? 'Takeaway'
                                : 'Dine-In'}
                            </button>
                          ))}
                        </div>

                        {/* Mandatory 5KM Delivery Radius Check when Delivery Selected */}
                        {customerMeta.orderType === 'delivery' && (
                          <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-amber-500" />
                              <span>Delivery Radius Check / دوری کا تعین:</span>
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setCustomerMeta((prev) => ({
                                    ...prev,
                                    deliveryRadius: 'within-5km',
                                  }))
                                }
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  customerMeta.deliveryRadius === 'within-5km'
                                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                                }`}
                              >
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <span>Within 5 KM</span>
                                  <span className="text-[10px] px-1 py-0.2 rounded-sm bg-emerald-500/20 text-emerald-300">
                                    FREE
                                  </span>
                                </span>
                                <span className="text-[10px] font-urdu mt-1" dir="rtl">
                                  مفت ڈلیوری (0 روپے)
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setCustomerMeta((prev) => ({
                                    ...prev,
                                    deliveryRadius: 'beyond-5km',
                                  }))
                                }
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  customerMeta.deliveryRadius === 'beyond-5km'
                                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                                }`}
                              >
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <span>Beyond 5 KM</span>
                                  <span className="text-[10px] px-1 py-0.2 rounded-sm bg-amber-500/20 text-amber-300">
                                    Rs. 150
                                  </span>
                                </span>
                                <span className="text-[10px] font-urdu mt-1" dir="rtl">
                                  اضافی فاصلہ (150 روپے)
                                </span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Customer Fields */}
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Your Name / گاہک کا نام:
                            </label>
                            <div className="relative">
                              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                              <input
                                type="text"
                                value={customerMeta.customerName}
                                onChange={(e) =>
                                  setCustomerMeta((prev) => ({
                                    ...prev,
                                    customerName: e.target.value,
                                  }))
                                }
                                placeholder="e.g. Tariq Dogar"
                                style={{
                                  backgroundColor: theme.bgCard,
                                  borderColor: theme.borderSubtle,
                                  color: theme.textPrimary,
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Contact Number / رابطہ نمبر:
                            </label>
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                              <input
                                type="tel"
                                value={customerMeta.phone}
                                onChange={(e) =>
                                  setCustomerMeta((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="0300-1234567"
                                style={{
                                  backgroundColor: theme.bgCard,
                                  borderColor: theme.borderSubtle,
                                  color: theme.textPrimary,
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {customerMeta.orderType === 'delivery' && (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                  Nearest Landmark Pin / قریبی مشہور مقام:
                                </label>
                                <select
                                  value={customerMeta.nearestLandmark}
                                  onChange={(e) =>
                                    setCustomerMeta((prev) => ({
                                      ...prev,
                                      nearestLandmark: e.target.value,
                                    }))
                                  }
                                  style={{
                                    backgroundColor: theme.bgCard,
                                    borderColor: theme.borderSubtle,
                                    color: theme.textPrimary,
                                  }}
                                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden"
                                >
                                  {LOCAL_LANDMARK_PINS.map((pin) => (
                                    <option key={pin.id} value={pin.nameEn}>
                                      {pin.icon} {pin.nameEn} ({pin.distanceEstimate})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                  Full Delivery Address / مکمل پتہ:
                                </label>
                                <div className="relative">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                                  <textarea
                                    rows={2}
                                    value={customerMeta.deliveryAddress}
                                    onChange={(e) =>
                                      setCustomerMeta((prev) => ({
                                        ...prev,
                                        deliveryAddress: e.target.value,
                                      }))
                                    }
                                    placeholder="House/Shop #, Street, Mohallah / علاقہ"
                                    style={{
                                      backgroundColor: theme.bgCard,
                                      borderColor: theme.borderSubtle,
                                      color: theme.textPrimary,
                                    }}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-hidden resize-none"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {customerMeta.orderType === 'dinein' && (
                            <div>
                              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                                Table Number / ٹیبل نمبر:
                              </label>
                              <input
                                type="text"
                                value={customerMeta.tableNumber || ''}
                                onChange={(e) =>
                                  setCustomerMeta((prev) => ({
                                    ...prev,
                                    tableNumber: e.target.value,
                                  }))
                                }
                                placeholder="e.g. Table 4 or VIP Cabin"
                                style={{
                                  backgroundColor: theme.bgCard,
                                  borderColor: theme.borderSubtle,
                                  color: theme.textPrimary,
                                }}
                                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ============================================================== */}
              {/* TAB B: ORDER HISTORY VIEW (SAVED IN BROWSER LOCALSTORAGE) */}
              {/* ============================================================== */}
              {activeDrawerTab === 'order-history' && (
                <div className="space-y-4">
                  {/* History Toolbar Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        <span>Previous WhatsApp Orders ({orderHistory.length})</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-urdu mt-0.5" dir="rtl">
                        محفوظ شدہ سابقہ آرڈرز جو واٹس ایپ پر بھیجے گئے
                      </p>
                    </div>

                    {orderHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {orderHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <History className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">No Previous Orders Yet</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        Whenever you order through WhatsApp, your itemized receipts are automatically recorded here in your browser&apos;s LocalStorage.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveDrawerTab('current-tray')}
                        style={{
                          backgroundColor: theme.accent,
                          color: theme.accentText,
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Current Tray / موجودہ ٹرے</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {orderHistory.map((order) => {
                        const isCopied = copiedOrderId === order.id;

                        return (
                          <div
                            key={order.id}
                            style={{
                              backgroundColor: theme.bgSurface,
                              borderColor: theme.borderSubtle,
                            }}
                            className="p-4 rounded-2xl border space-y-3 transition-all hover:border-amber-500/40 shadow-sm"
                          >
                            {/* Card Top: Order Number + Date + Order Mode Badge */}
                            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-sm text-white">
                                    #{order.orderNumber}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    {order.customerMeta.orderType === 'delivery'
                                      ? 'Delivery'
                                      : order.customerMeta.orderType === 'takeaway'
                                      ? 'Takeaway'
                                      : 'Dine-In'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  <span>{order.dateFormatted}</span>
                                </div>
                              </div>

                              {/* Net Total Display */}
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                  Paid Total
                                </span>
                                <span className="text-base font-black text-amber-400 tabular-nums">
                                  Rs. {order.netTotal.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Itemized Dishes List */}
                            <div className="space-y-1.5 text-xs">
                              {order.items.map((dish, idx) => (
                                <div key={idx} className="flex items-center justify-between text-slate-300">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-500">{dish.quantity}x</span>
                                    <span>{dish.nameEn}</span>
                                    <span className="text-[11px] text-slate-500">
                                      ({dish.portion === 'full' ? 'Full' : 'Half'})
                                    </span>
                                  </div>
                                  <span className="font-mono text-slate-400">
                                    Rs. {(dish.unitPrice * dish.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}

                              {/* Customer / Landmark note */}
                              {order.customerMeta.nearestLandmark && (
                                <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span>{order.customerMeta.nearestLandmark}</span>
                                </p>
                              )}
                            </div>

                            {/* Card Actions: Re-order, Copy Receipt, Re-send WhatsApp */}
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                              {/* Re-order to Tray */}
                              <button
                                type="button"
                                onClick={() => handleReorder(order)}
                                style={{
                                  backgroundColor: theme.bgCard,
                                  borderColor: theme.borderStrong,
                                }}
                                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-200 hover:text-white hover:border-amber-500 transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Add these items back into cart tray"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                                <span>Re-Order / دوبارہ</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                {/* Copy Receipt */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyReceipt(order)}
                                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                                  }`}
                                  title="Copy formatted receipt text"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Receipt</span>
                                    </>
                                  )}
                                </button>

                                {/* Direct WhatsApp */}
                                <button
                                  type="button"
                                  onClick={() => handleResendWhatsApp(order)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                                  title="Open in WhatsApp"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 4. ORDER SUMMARY & FINAL WHATSAPP CHECKOUT TRIGGER (VISIBLE ON CURRENT TRAY) */}
            {activeDrawerTab === 'current-tray' && cartItems.length > 0 && (
              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.borderSubtle,
                }}
                className="p-4 border-t space-y-3 shrink-0"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Items Subtotal / مصنوعات کی رقم:</span>
                    <span className="font-semibold tabular-nums text-white">
                      Rs. {itemsSubtotal.toLocaleString()}
                    </span>
                  </div>
                  {customerMeta.orderType === 'delivery' && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>
                        Delivery Fee ({customerMeta.deliveryRadius === 'within-5km' ? 'Within 5 KM Free' : 'Beyond 5 KM'}):
                      </span>
                      <span className={`font-bold tabular-nums ${deliveryFee === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {deliveryFee === 0 ? 'FREE (Rs. 0)' : `Rs. ${deliveryFee}`}
                      </span>
                    </div>
                  )}
                  <div
                    style={{ borderColor: theme.borderSubtle }}
                    className="pt-2 border-t flex items-center justify-between text-base font-extrabold"
                  >
                    <span>Net Total / کل رقم:</span>
                    <span className="text-amber-500 text-lg tabular-nums">
                      Rs. {netTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {showLocationError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Please confirm your delivery distance zone (Within 5KM or Beyond 5KM).</span>
                  </div>
                )}

                {orderSentSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>WhatsApp launched & order saved to history in LocalStorage!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Order to WhatsApp (0300-9346628)</span>
                  <span className="font-urdu text-xs">واٹس ایپ آرڈر</span>
                </button>
              </div>
            )}

            {/* In case user is in Order History and has items in tray: Quick Jump Banner */}
            {activeDrawerTab === 'order-history' && cartItems.length > 0 && (
              <div
                style={{
                  backgroundColor: theme.bgSurface,
                  borderColor: theme.borderSubtle,
                }}
                className="p-3 border-t flex items-center justify-between gap-2 shrink-0 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in Current Tray (Rs. {itemsSubtotal.toLocaleString()})
                  </span>
                  <span className="text-[11px] text-slate-400">Ready to proceed to checkout</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('current-tray')}
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accentText,
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

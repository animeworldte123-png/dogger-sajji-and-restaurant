export type GlobalThemeId = 
  | 'clean-white'
  | 'charcoal-gold'
  | 'smoky-rose'
  | 'midnight-black'
  | 'emerald-luxury'
  | 'crimson-cream'
  | 'terracotta-bistro'
  | 'midnight-sapphire'
  | 'vintage-olive'
  | 'sand-linen'
  // 6 MULTI-COLOR RAINBOW SCHEMES
  | 'rainbow-aurora-spectrum'
  | 'rainbow-sunset-prism'
  | 'rainbow-neon-iridescent'
  | 'rainbow-cosmic-chroma'
  | 'rainbow-tropical-opal'
  | 'rainbow-cyber-wave'
  // 6 BALANCED MULTI-TONE MATRICES
  | 'multitone-emerald-gold'
  | 'multitone-terracotta-charcoal'
  | 'multitone-sapphire-brass'
  | 'multitone-desert-sunset'
  | 'multitone-copper-teal'
  | 'multitone-castiron-paprika';

export type BespokeThemeId =
  | 'cherry-pin'
  | 'smok'
  | 'green-sunlight';

export type ThemeId = GlobalThemeId | BespokeThemeId;

// 6 TYPOGRAPHY THEMATIC LAYOUTS
export type TypographyLayoutId =
  | 'modern-nastaliq-serif'
  | 'bold-heritage-kufic'
  | 'clean-minimalist-sans'
  | 'premium-bistro-mono'
  | 'cyber-hybrid-roman'
  | 'classic-regal-italic';

export interface TypographyLayoutConfig {
  id: TypographyLayoutId;
  nameEn: string;
  nameUr: string;
  description: string;
  badge: string;
  fontFamilyClass: string;
  headingStyle: string;
  urduStyle: string;
  subtextStyle: string;
  priceStyle: string;
}

// 9 HIGH-CONTRAST TEXT COLOR PALETTES
export type TextColorPaletteId =
  | 'charcoal-gold'
  | 'royal-emerald-cream'
  | 'crimson-flame'
  | 'midnight-contrast'
  | 'warm-amber-espresso'
  | 'royal-sapphire-platinum'
  | 'terracotta-dune'
  | 'obsidian-neon-gold'
  | 'velvet-plum-rose';

export interface TextColorPaletteConfig {
  id: TextColorPaletteId;
  nameEn: string;
  nameUr: string;
  badge: string;
  titleColor: string;
  headingColor: string;
  priceColor: string;
  urduColor: string;
  mutedColor: string;
  previewBg: string;
}

// 5 DYNAMIC RAINBOW BUTTON ACCENT TEMPLATES + DEFAULT
export type ButtonThemeId =
  | 'default-emerald-rose' // Default: Emerald Green (#059669) & Soft Rose Pink (#FFEBEE) with Red Typography (#D32F2F)
  | 'btn-rainbow-aurora'
  | 'btn-rainbow-prism'
  | 'btn-rainbow-sunset'
  | 'btn-rainbow-opal'
  | 'btn-rainbow-neon';

export interface ButtonThemeConfig {
  id: ButtonThemeId;
  nameEn: string;
  nameUr: string;
  description: string;
  badge: string;
  trayBtnBg: string;
  trayBtnText: string;
  trayBtnBorder?: string;
  orderBtnBg: string;
  orderBtnText: string;
  orderBtnBorder?: string;
  gradientStyle?: string;
}

export type BlockShape = 'soft-curved' | 'square' | 'square-box' | 'triangular-mask' | 'circular-canvas';

export type BlockStyleSchemeId =
  | 'block-elevated-card'
  | 'block-glassmorphism'
  | 'block-accent-border'
  | 'block-dark-inset'
  | 'block-warm-parchment'
  | 'block-split-contrast';

export type LightingModeId =
  | 'neon-glow'
  | 'night-backlight'
  | 'golden-radiance'
  | 'emerald-shimmer'
  | 'pulse-borders'
  | 'minimalist-flat';

export interface LightingModeConfig {
  id: LightingModeId;
  nameEn: string;
  nameUr: string;
  description: string;
  glowClass: string;
  badge: string;
}

export interface BlockStyleSchemeConfig {
  id: BlockStyleSchemeId;
  nameEn: string;
  nameUr: string;
  description: string;
  cardClass: string;
  badge: string;
}

export interface ThemeStyleConfig {
  id: ThemeId;
  nameEn: string;
  nameUr: string;
  type: 'global' | 'bespoke';
  badge: string;
  bgCanvas: string;
  bgSurface: string;
  bgSurfaceHover: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  borderSubtle: string;
  borderStrong: string;
  pillActiveBg: string;
  pillActiveText: string;
  specialClass?: string;
  gradientAccent?: string;
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameUr: string;
  categoryId: string;
  menuGroup: 'priority' | 'extended';
  descriptionEn: string;
  descriptionUr: string;
  image: string;
  hasPortions: boolean;
  prices: {
    full: number;
    half?: number;
  };
  defaultPortion: 'full' | 'half';
  prepTime: string;
  isPopular?: boolean;
  isSignature?: boolean;
  badge?: string;
  isExcludedFastFood?: boolean;
}

export interface AddOnOption {
  id: string;
  nameEn: string;
  nameUr: string;
  category: 'drinks' | 'sides' | 'bread';
  price: number;
  volumeOrSize?: string;
}

export interface CartAddOnItem {
  addOnId: string;
  nameEn: string;
  nameUr: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  nameEn: string;
  nameUr: string;
  portion: 'full' | 'half' | 'single';
  unitPrice: number;
  quantity: number;
  selectedAddOns: CartAddOnItem[];
  specialInstructions?: string;
}

export interface OdooBlock {
  id: string;
  titleEn: string;
  titleUr: string;
  subtitleEn: string;
  subtitleUr: string;
  contentEn: string;
  contentUr: string;
  shape: BlockShape;
  themeOverride?: ThemeId | 'inherit';
  image?: string;
  badgeEn?: string;
  badgeUr?: string;
  callToActionTextEn?: string;
  callToActionTextUr?: string;
  callToActionLink?: string;
  isEnabled: boolean;
  displayOrder: number;
  tagEn?: string;
  tagUr?: string;
  pricingEn?: string;
  pricingUr?: string;
  comboPackageDetails?: string;
}

export interface RestaurantGuideline {
  id: string;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  iconName: string;
}

export interface LandmarkPin {
  id: string;
  nameEn: string;
  nameUr: string;
  category: 'bank' | 'school' | 'store' | 'road' | 'health' | 'auto';
  icon: string;
  distanceEstimate: string;
}

export interface RestaurantState {
  version: number;
  restaurantNameEn: string;
  restaurantNameUr: string;
  taglineEn: string;
  taglineUr: string;
  hotlineFormatted: string; // "0300-9346628"
  hotlineWhatsappRaw: string; // "923009346628"
  addressEn: string;
  addressUr: string;
  timingsEn: string;
  timingsUr: string;
  adminPasswordToken: string; // default "12345"
  globalTheme: ThemeId;
  activeLightingMode?: LightingModeId;
  activeBlockScheme?: BlockStyleSchemeId;
  logoImage: string;
  heroImage: string;
  menuItems: MenuItem[];
  addOns: AddOnOption[];
  odooBlocks: OdooBlock[];
  guidelines: RestaurantGuideline[];
  galleryImages: string[];
  // OWNER PROFILE & PASSPORT FRAME
  ownerNameEn: string;
  ownerNameUr: string;
  ownerTitleEn: string;
  ownerTitleUr: string;
  ownerMessageEn: string;
  ownerMessageUr: string;
  ownerPassportImage: string;
  // DYNAMIC 9 RED-PIN LANDMARKS
  landmarks: LandmarkPin[];
  // DUAL-VIEW CARD ENGINE (MOBILE 1-ROW VS PC 2-GRID)
  catalogViewMode?: 'mobile-default' | 'desktop-grid';
  // DEDICATED TYPOGRAPHY SEGMENTATION MODULE (THE TYPE SECTION ENGINE)
  activeTypographyLayout?: TypographyLayoutId;
  activeTextColorPalette?: TextColorPaletteId;
  // 5 DYNAMIC RAINBOW BUTTON ACCENT TEMPLATES
  activeButtonTheme?: ButtonThemeId;
}

export interface SavedOrderRecord {
  id: string;
  orderNumber: string;
  dateFormatted: string;
  timestamp: number;
  items: CartItem[];
  customerMeta: {
    customerName: string;
    phone: string;
    deliveryAddress: string;
    orderType: 'delivery' | 'takeaway' | 'dinein';
    deliveryRadius?: 'within-5km' | 'beyond-5km';
    nearestLandmark?: string;
    tableNumber?: string;
    specialInstructions?: string;
  };
  itemsSubtotal: number;
  deliveryFee: number;
  netTotal: number;
  receiptMessage: string;
}

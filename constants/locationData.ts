export interface LandmarkPin {
  id: string;
  nameEn: string;
  nameUr: string;
  category: 'bank' | 'school' | 'store' | 'road' | 'health' | 'auto';
  icon: string;
  distanceEstimate: string;
}

export const LOCAL_LANDMARK_PINS: LandmarkPin[] = [
  {
    id: 'kasur-road',
    nameEn: 'Main Sarak / Kasur Road',
    nameUr: 'مین سڑک / قصور روڈ',
    category: 'road',
    icon: 'Navigation',
    distanceEstimate: 'Direct Frontage / مین پر',
  },
  {
    id: 'mehar-kafeel-auto',
    nameEn: 'Mehar Kafeel Auto',
    nameUr: 'مہر کفیل آٹو',
    category: 'auto',
    icon: 'Wrench',
    distanceEstimate: 'Adjacent / متصل',
  },
  {
    id: 'sindh-bank',
    nameEn: 'Sindh Bank',
    nameUr: 'سندھ بینک',
    category: 'bank',
    icon: 'Building2',
    distanceEstimate: '100m Landmark',
  },
  {
    id: 'govt-faiz-school',
    nameEn: 'Govt Faiz e Aam School',
    nameUr: 'گورنمنٹ فیض عام اسکول',
    category: 'school',
    icon: 'GraduationCap',
    distanceEstimate: '250m Walk',
  },
  {
    id: 'ayat-quran-academy',
    nameEn: 'Ayat-ul-Quran Academy',
    nameUr: 'آیات القرآن اکیڈمی',
    category: 'school',
    icon: 'BookOpen',
    distanceEstimate: '300m Turn',
  },
  {
    id: 'krown-dollar-store',
    nameEn: 'Krown Dollar Store',
    nameUr: 'کراؤن ڈالر اسٹور',
    category: 'store',
    icon: 'ShoppingBag',
    distanceEstimate: '150m Opposite',
  },
  {
    id: 'faiz-e-aam-road',
    nameEn: 'Faiz E Aam Road',
    nameUr: 'فیض عام روڈ',
    category: 'road',
    icon: 'Compass',
    distanceEstimate: 'Crossing Junction',
  },
  {
    id: 'green-plus-pharmacy',
    nameEn: 'Green Plus Pharmacy',
    nameUr: 'گرین پلس فارمیسی',
    category: 'health',
    icon: 'HeartPulse',
    distanceEstimate: '200m Nearby',
  },
  {
    id: 'hamid-garments',
    nameEn: 'Hamid Garments',
    nameUr: 'حامد گارمنٹس',
    category: 'store',
    icon: 'Tag',
    distanceEstimate: '180m Bazaar',
  },
];

// 策展飯店/房型常用 Font Awesome 圖示清單
// icon name 對應 FA class（使用時: <i class="fas {name}">）
export interface FacilityIconDef {
  name: string
  label: string
}

export const FACILITY_ICONS: FacilityIconDef[] = [
  // ── 房間屬性 ──────────────────────────────────────
  { name: 'fa-layer-group', label: 'High Floor' },
  { name: 'fa-smoking-ban', label: 'Non-Smoking' },
  { name: 'fa-smoking', label: 'Smoking Allowed' },
  { name: 'fa-window-maximize', label: 'Window' },
  { name: 'fa-door-open', label: 'Balcony' },
  { name: 'fa-mountain', label: 'Mountain View' },
  { name: 'fa-water', label: 'Ocean View' },
  { name: 'fa-city', label: 'City View' },
  { name: 'fa-moon', label: 'Quiet Room' },
  { name: 'fa-wheelchair', label: 'Accessible' },
  { name: 'fa-dog', label: 'Pet Friendly' },

  // ── 床型 ──────────────────────────────────────────
  { name: 'fa-bed', label: 'Bed' },
  { name: 'fa-child', label: 'Child Bed' },
  { name: 'fa-couch', label: 'Sofa Bed' },

  // ── 衛浴 ──────────────────────────────────────────
  { name: 'fa-bath', label: 'Bathtub' },
  { name: 'fa-shower', label: 'Shower' },
  { name: 'fa-wind', label: 'Hair Dryer' },
  { name: 'fa-pump-soap', label: 'Toiletries' },
  { name: 'fa-toilet', label: 'Toilet' },
  { name: 'fa-hot-tub', label: 'Jacuzzi' },

  // ── 客房設施 ──────────────────────────────────────
  { name: 'fa-snowflake', label: 'Air Conditioning' },
  { name: 'fa-temperature-low', label: 'Refrigerator' },
  { name: 'fa-tv', label: 'TV' },
  { name: 'fa-wifi', label: 'Wi-Fi' },
  { name: 'fa-phone', label: 'Phone' },
  { name: 'fa-vault', label: 'Safe' },
  { name: 'fa-box-open', label: 'Minibar' },
  { name: 'fa-coffee', label: 'Coffee Maker' },
  { name: 'fa-mug-hot', label: 'Kettle' },
  { name: 'fa-shirt', label: 'Iron' },
  { name: 'fa-bolt', label: 'Hair Straightener' },
  { name: 'fa-desktop', label: 'Desk' },
  { name: 'fa-chair', label: 'Chair' },
  { name: 'fa-lightbulb', label: 'Reading Light' },

  // ── 飯店公共設施 ──────────────────────────────────
  { name: 'fa-swimming-pool', label: 'Pool' },
  { name: 'fa-dumbbell', label: 'Gym' },
  { name: 'fa-spa', label: 'Spa' },
  { name: 'fa-concierge-bell', label: 'Room Service' },
  { name: 'fa-utensils', label: 'Restaurant' },
  { name: 'fa-cocktail', label: 'Bar' },
  { name: 'fa-parking', label: 'Parking' },
  { name: 'fa-shuttle-van', label: 'Airport Shuttle' },
  { name: 'fa-business-time', label: 'Business Center' },
  { name: 'fa-baby', label: 'Baby Crib' },
  { name: 'fa-suitcase', label: 'Luggage Storage' },
  { name: 'fa-key', label: 'Key Card' },
  { name: 'fa-bell', label: '24h Reception' },
  { name: 'fa-fire-extinguisher', label: 'Fire Safety' },

  // ── 餐飲 ──────────────────────────────────────────
  { name: 'fa-bread-slice', label: 'Breakfast' },
  { name: 'fa-fish', label: 'Seafood' },
  { name: 'fa-leaf', label: 'Vegetarian' },

  // ── 其他 ──────────────────────────────────────────
  { name: 'fa-star', label: 'Featured' },
  { name: 'fa-check-circle', label: 'Available' },
  { name: 'fa-ban', label: 'Not Available' },
  { name: 'fa-info-circle', label: 'Info' },
]

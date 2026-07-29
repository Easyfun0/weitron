// 前台文字大小設定：改的是 <html> 根元素的 font-size，
// Tailwind 預設的字級/間距（text-sm、p-4...）大多是 rem 單位，相對於根字級，
// 所以調整這一個值就能讓整個前台頁面等比放大，不用一個個元件加字級 class。
// 後台管理不套用這個設定（AdminLayout 會在掛載時強制重設回標準字級）。
export const FONT_SIZE_KEY = "font_size_scale";

export const FONT_SIZE_OPTIONS = [
  { value: "normal", label: "標準字型", px: "16px" },
  { value: "large", label: "大字型", px: "18px" },
  { value: "xlarge", label: "特大字型", px: "20px" },
];

export function getStoredFontSize() {
  return localStorage.getItem(FONT_SIZE_KEY) || "normal";
}

export function applyFontSize(scale) {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.value === scale) || FONT_SIZE_OPTIONS[0];
  document.documentElement.style.fontSize = opt.px;
}

export function resetFontSize() {
  document.documentElement.style.fontSize = FONT_SIZE_OPTIONS[0].px;
}

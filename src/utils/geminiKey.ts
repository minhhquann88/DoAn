/**
 * Utility để quản lý Gemini API Key
 * Ưu tiên: .env > localStorage
 */

const GEMINI_KEY_STORAGE = 'gemini_api_key';

/**
 * Lấy Gemini API Key
 * Ưu tiên: VITE_GEMINI_API_KEY từ .env, sau đó localStorage
 */
export const resolveGeminiApiKey = (): string | null => {
  // Ưu tiên lấy từ .env (Vite)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Fallback: lấy từ localStorage
  const storedKey = localStorage.getItem(GEMINI_KEY_STORAGE);
  if (storedKey) {
    return storedKey;
  }

  return null;
};

/**
 * Lưu Gemini API Key vào localStorage
 */
export const saveGeminiKey = (key: string): void => {
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
  // Dispatch event để các component khác biết key đã thay đổi
  window.dispatchEvent(new Event('geminiKeyChanged'));
};

/**
 * Xóa Gemini API Key
 */
export const clearGeminiKey = (): void => {
  localStorage.removeItem(GEMINI_KEY_STORAGE);
  window.dispatchEvent(new Event('geminiKeyChanged'));
};

/**
 * Kiểm tra xem có API key không
 */
export const hasGeminiKey = (): boolean => {
  return resolveGeminiApiKey() !== null;
};


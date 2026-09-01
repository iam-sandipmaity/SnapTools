/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXCHANGERATE_API_KEY?: string;
  readonly VITE_YOUTUBE_API_KEY?: string;
  readonly VITE_APIFLASH_API_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_DISABLE_ANALYTICS?: string;
  readonly VITE_JDOODLE_CLIENT_ID?: string;
  readonly VITE_JDOODLE_CLIENT_SECRET?: string;
}

declare global {
  interface Window {
    exifr: any;
  }
}

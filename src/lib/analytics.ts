type AnalyticsEvent =
    | { type: 'donation:amount_selected'; amount: number }
    | { type: 'donation:custom_amount_submitted'; amount: number }
    | { type: 'donation:razorpay_opened'; amount: number }
    | { type: 'donation:success'; amount: string; currency: string; payment_id: string }
    | { type: 'donation:upi_qr_opened'; upi: string }
    | { type: 'donation:copy'; item: 'upi' | 'btc' | 'receipt' }
    | { type: 'workstation:focus_mode'; enabled: boolean }
    | { type: 'workstation:shortcut_used'; key: string }
    | { type: 'navigation:module_opened'; category: string; tool: string };

const sessionLog: { type: string, timestamp: string }[] = [];

export const getSessionLog = () => sessionLog;

export const trackEvent = (event: AnalyticsEvent) => {
    if (typeof window === 'undefined') return;

    // Track in local session log for the UI console
    sessionLog.unshift({
        type: event.type.split(':').pop() || event.type,
        timestamp: new Date().toLocaleTimeString()
    });
    if (sessionLog.length > 20) sessionLog.pop();

    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${event.type}`, event);
    }

    // Dispatch custom event for external trackers (e.g. GTM, PostHog)
    window.dispatchEvent(new CustomEvent('snaptools:event', { detail: event }));
};

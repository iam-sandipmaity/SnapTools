import { lazy } from 'react';

const privacyTools = {
    "privacy-policy": lazy(() => import('./PrivacyPolicyGenerator')),
    "terms-generator": lazy(() => import('./TermsGenerator')),
    "cookie-policy": lazy(() => import('./CookiePolicyGenerator')),
    "disclaimer-generator": lazy(() => import('./DisclaimerGenerator')),
    "gdpr-checker": lazy(() => import('./GDPRChecker')),
};

export default privacyTools;

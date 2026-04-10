import { lazy } from 'react';

const businessTools = {
    'email-signature-generator': lazy(() => import('./EmailSignatureGenerator')),
    'resume-builder': lazy(() => import('./ResumeBuilder')),
    'invoice-generator': lazy(() => import('./InvoiceGenerator')),
    'receipt-maker': lazy(() => import('./ReceiptMaker')),
    'business-card-generator': lazy(() => import('./BusinessCardGenerator')),
    'logo-maker': lazy(() => import('./LogoMaker')),
    'meme-generator': lazy(() => import('./MemeGenerator')),
};

export default businessTools;

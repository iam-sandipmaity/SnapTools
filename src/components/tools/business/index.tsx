import EmailSignatureGenerator from './EmailSignatureGenerator';
import ResumeBuilder from './ResumeBuilder';
import InvoiceGenerator from './InvoiceGenerator';
import ReceiptMaker from './ReceiptMaker';
import BusinessCardGenerator from './BusinessCardGenerator';
import LogoMaker from './LogoMaker';
import MemeGenerator from './MemeGenerator';

const businessTools = {
    'email-signature-generator': EmailSignatureGenerator,
    'resume-builder': ResumeBuilder,
    'invoice-generator': InvoiceGenerator,
    'receipt-maker': ReceiptMaker,
    'business-card-generator': BusinessCardGenerator,
    'logo-maker': LogoMaker,
    'meme-generator': MemeGenerator,
};

export default businessTools;

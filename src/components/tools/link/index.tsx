
import UrlShortener from "./UrlShortener";
import LinkPreview from "./LinkPreview";
import UrlParser from "./UrlParser";
import UrlToQrCode from "./UrlToQrCode";

const linkTools = {
    "url-shortener": UrlShortener,
    "link-preview": LinkPreview,
    "url-parser": UrlParser,
    "url-to-qr-code": UrlToQrCode,
};

export default linkTools;

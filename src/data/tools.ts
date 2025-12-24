
import {
  Image,
  FileText,
  Calculator,
  Code,
  QrCode,
  KeyRound,
  PaintBucket,
  Ruler,
  IndianRupee,
  FileType,
  Eye,
  Youtube,
  Globe,
  Wrench,
  Zap,
  Currency,
  Clock,
  FileIcon,
} from "lucide-react";

export type ToolCategory = {
  id: string;
  title: string;
  icon: any;
  description?: string;
  color?: string;
  gradient?: {
    from: string;
    to: string;
  };
  subTools?: {
    id: string;
    title: string;
    description?: string;
  }[];
};

export const toolCategories: ToolCategory[] = [
  {
    id: "image",
    title: "Image",
    icon: Image,
    color: "bg-tooltopia-soft-blue",
    subTools: [
      { id: "image-compressor", title: "Image Compressor" },
      { id: "image-size-increaser", title: "Image Size Increaser" },
      { id: "image-base64", title: "Image to Base64 / Base64 to Image" },
      { id: "image-format-converter", title: "Image Format Converter" },
      { id: "image-dimension-changer", title: "Image Dimension Changer" },
      { id: "image-cropper", title: "Image Cropper" },
      { id: "image-color-inverter", title: "Image Color Inverter" },
      { id: "image-black-and-white", title: "Image Black And White" },
      { id: "image-filter-effects", title: "Image Filter Effects" },
    ],
  },
  {
    id: "pdf",
    title: "PDF",
    icon: FileText,
    color: "bg-tooltopia-soft-pink",
    subTools: [
      { id: "pdf-merger", title: "PDF Merger" },
      { id: "pdf-splitter", title: "PDF Splitter" },
      { id: "pdf-organizer", title: "PDF Organizer" },
      { id: "pdf-word", title: "PDF to Word / Word to PDF" },
      { id: "pdf-jpg", title: "PDF to JPG / JPG to PDF" },
      { id: "pdf-compress", title: "Compress PDF" },
      { id: "pdf-unlock", title: "Unlock PDF" },
    ],
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: Calculator,
    color: "bg-tooltopia-soft-green",
    subTools: [
      { id: "basic-calculator", title: "Basic Calculator" },
      { id: "scientific-calculator", title: "Scientific Calculator" },
      { id: "bmi-calculator", title: "BMI Calculator" },
      { id: "age-calculator", title: "Age Calculator" },
    ],
  },
  {
    id: "conversion",
    title: "Conversion Tools",
    icon: Zap,
    color: "bg-tooltopia-soft-yellow",
    subTools: [
      { id: "binary-decimal", title: "Binary ⇄ Decimal" },
      { id: "binary-hex", title: "Binary ⇄ Hex" },
      { id: "hex-decimal", title: "Hex ⇄ Decimal" },
      { id: "base64", title: "Base64 Encode / Decode" },
      { id: "text-ascii", title: "Text ⇄ ASCII" },
      { id: "timestamp-converter", title: "Timestamp Converter" },
      { id: "timezone-converter", title: "Time Zone Converter" },
      { id: "morse-code-converter", title: "Morse Code Converter" },
    ],
  },
  {
    id: "code",
    title: "Code Tools",
    icon: Code,
    color: "bg-tooltopia-soft-purple",
    subTools: [
      { id: "code-runner", title: "Code Runner" },
      { id: "code-formatter", title: "Code Formatter" },
      { id: "json-formatter", title: "JSON Formatter / Validator" },
      { id: "xml-formatter", title: "XML Formatter" },
      { id: "html-formatter", title: "HTML Minifier / Beautifier" },
      { id: "css-formatter", title: "CSS Minifier / Beautifier" },
      { id: "js-minifier", title: "JavaScript Minifier" },
    ],
  },
  {
    id: "qr",
    title: "QR Tools",
    icon: QrCode,
    color: "bg-tooltopia-soft-orange",
    subTools: [
      { id: "qr-generator", title: "QR Code Generator" },
      { id: "barcode-generator", title: "Barcode Generator" },
      { id: "qr-scanner", title: "QR Code Scanner" },
    ],
  },
  {
    id: "password",
    title: "Password & Text Tools",
    icon: KeyRound,
    color: "bg-tooltopia-soft-peach",
    subTools: [
      { id: "password-generator", title: "Password Generator" },
      { id: "lorem-ipsum-generator", title: "Lorem Ipsum Generator" },
      { id: "word-counter", title: "Word Counter" },
      { id: "character-counter", title: "Character Counter" },
    ],
  },
  {
    id: "color",
    title: "Color & Design Tools",
    icon: PaintBucket,
    color: "bg-tooltopia-soft-pink",
    subTools: [
      { id: "color-picker", title: "Color Picker" },
      { id: "hex-rgb", title: "Hex ⇄ RGB Converter" },
      { id: "gradient-generator", title: "Gradient Generator" },
    ],
  },
  {
    id: "unit",
    title: "Unit Converters",
    icon: Ruler,
    color: "bg-tooltopia-soft-blue",
    subTools: [
      { id: "length-converter", title: "Length" },
      { id: "weight-converter", title: "Weight" },
      { id: "temperature-converter", title: "Temperature" },
      { id: "speed-converter", title: "Speed" },
      { id: "area-converter", title: "Area" },
      { id: "volume-converter", title: "Volume" },
      { id: "pressure-converter", title: "Pressure" },
    ],
  },
  {
    id: "currency",
    title: "Currency Tools",
    icon: IndianRupee,
    color: "bg-tooltopia-soft-green",
    subTools: [
      { id: "currency-converter", title: "Currency Converter" },
      { id: "crypto-converter", title: "Cryptocurrency Converter" },
    ],
  },
  {
    id: "document",
    title: "Document Converters",
    icon: FileType,
    color: "bg-tooltopia-soft-green",
    subTools: [
      { id: "word-pdf", title: "Word to PDF / PDF to Word" },
      { id: "excel-pdf", title: "Excel to PDF / PDF to Excel" },
      { id: "ppt-pdf", title: "PPT to PDF / PDF to PPT" },
      { id: "txt-pdf", title: "TXT to PDF / PDF to TXT" },
    ],
  },
  {
    id: "social",
    title: "social media",
    icon: Youtube,
    color: "bg-tooltopia-soft-peach",
    subTools: [
      { id: "yt-thumbnail", title: "YouTube Thumbnail Downloader" },
      { id: "yt-video", title: "YouTube Video Downloader" },
      { id: "tweet-generator", title: "Tweet Generator" },
      { id: "instagram-post", title: "Instagram Post Generator" },
      { id: "instagram-downloader", title: "Instagram Photo Downloader" },
      { id: "yt-trending", title: "Youtube Trending" },
      { id: "yt-tags", title: "Youtube Tags" },
      { id: "yt-most-viewed", title: "Youtube Most Viewed" },
      { id: "youtube-stats", title: "Youtube Stats" },
    ],
  },
  {
    id: "seoandweb",
    title: "SEO & Web Tools",
    icon: Globe,
    color: "bg-tooltopia-soft-purple",
    subTools: [
      { id: "meta-generator", title: "Meta Tag Generator" },
      { id: "ogen-preview", title: "Open Graph Preview" },
      { id: "website-screenshot", title: "Website Screenshot Tool" },
    ],
  },
  {
    id: "miscellaneous",
    title: "Miscellaneous Tools",
    icon: Wrench,
    color: "bg-tooltopia-soft-yellow",
    subTools: [
      { id: "uuid_generator", title: "UUID Generator" },
      { id: "number-words", title: "Number to Words" },
      { id: "words-number", title: "Words to Number" },
      { id: "file-corruptor", title: "File Corruptor" },
      { id: "random-ip-generator", title: "Random IP Generator" },
      { id: "webcam-test", title: "Webcam Tester" },
    ],
  },
  {
    id: "encryption",
    title: "encryption Tools",
    icon: Eye,
    color: "bg-tooltopia-soft-yellow",
    subTools: [
      { id: "aes", title: "AES Encryption", description: "Advanced Encryption Standard - A symmetric encryption algorithm widely used for secure data transmission" },
      { id: "base64", title: "Base64 Encryption", description: "Encoding scheme that converts binary data into ASCII text format" },
      { id: "blowfish", title: "Blowfish Encryption", description: "Symmetric block cipher designed for fast encryption of data" },
      { id: "cast5", title: "CAST5 Encryption", description: "Symmetric key block cipher using a 128-bit key" },
      { id: "des", title: "DES Encryption", description: "Data Encryption Standard - Classic symmetric encryption algorithm" },
      { id: "3des", title: "3DES Encryption", description: "Triple DES - Applies DES cipher algorithm three times to each data block" },
      { id: "rsa", title: "RSA Encryption", description: "Public-key cryptosystem for secure data transmission" },
      { id: "sha", title: "SHA Encryption", description: "Secure Hash Algorithm - Creates fixed-size hash value from data" },
      { id: "md5", title: "MD5 Encryption", description: "Message-Digest Algorithm - Produces 128-bit hash value" },
      { id: "md4", title: "MD4 Encryption", description: "Message-Digest Algorithm v4 - Predecessor to MD5" },
      { id: "md2", title: "MD2 Encryption", description: "Message-Digest Algorithm v2 - Optimized for 8-bit computers" },
      { id: "mdc2", title: "MDC2 Encryption", description: "Modification Detection Code 2 - Block cipher-based hash function" },
      { id: "mcd", title: "MCD Encryption", description: "Modification Detection Code - cryptographic hash function that produces a fixed-length hash value" },
      { id: "url", title: "URL Encode/ Decode", description: "Converts special characters to URL-safe format" },
      { id: "html", title: "HTML Encode/ Decode", description: "Converts special characters to HTML entities" },
      { id: "ripemd160", title: "RIPEMD160 Encryption", description: "RACE Integrity Primitives Evaluation Message Digest - 160-bit cryptographic hash function" },
      { id: "bcrypt", title: "BCrypt Encryption", description: "Password hashing function designed to be slow and resist rainbow table attacks" },
      { id: "scrypt", title: "SCrypt Encryption", description: "Password-based key derivation function designed to be memory-hard" },
      { id: "pbkdf2", title: "PBKDF2 Encryption", description: "Password-Based Key Derivation Function 2 - Applies a pseudorandom function to derive keys" }
    ],
  },
  {
    id: "clock",
    title: "Clock Tools",
    icon: Clock,
    color: "bg-tooltopia-soft-purple",
    subTools: [
      { id: "current-time", title: "Current Time with Seconds" },
      { id: "stopwatch", title: "Stopwatch" },
      { id: "timer", title: "Timer" },
      { id: "world-clock", title: "World Clock" }
    ],
  },
  {
    id: "file",
    title: "File Share",
    icon: FileIcon,
    color: "bg-tooltopia-soft-purple",
    subTools: [
      { id: "file-share", title: "Share files" },
    ],
  },
];

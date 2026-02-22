import CryptoJS from 'crypto-js';

// MD2 S-table (pi substitution box) — defined in RFC 1319
const S = [
   41,  46,  67, 201, 162, 216, 124,   1,  61,  54,  84, 161, 236, 240,   6,
   19,  98, 167,   5, 243, 192, 199, 115, 140, 152, 147,  43, 217, 188,
   76, 130, 202,  30, 155,  87,  60, 253, 212, 224,  22, 103,  66, 111,  24,
  138,  23, 229,  18, 190,  78, 196, 214, 218, 158, 222,  73, 160, 251,
  245, 142, 187,  47, 238, 122, 169, 104, 121, 145,  21, 178,   7,  63,
  148, 194,  16, 137,  11,  34,  95,  33, 128, 127,  93, 154,  90, 144,
   50,  39,  53,  62, 204, 231, 191, 247, 151,   3, 255,  25,  48, 179,
   72, 165, 181, 209, 215,  94, 146,  42, 172,  86, 170, 198,  79, 184,
   56, 210, 150, 164, 125, 182, 118, 252, 107, 226, 156, 116,   4, 241,
   69, 157, 112,  89, 100, 113, 135,  32, 134,  91, 207, 101, 230,  45,
  168,   2,  27,  96,  37, 173, 174, 176, 185, 246,  28,  70,  97, 105,
   52,  64, 126,  15,  85,  71, 163,  35, 221,  81, 175,  58, 195,  92,
  249, 206, 186, 197, 234,  38,  44,  83,  13, 110, 133,  40, 132,   9,
  211, 223, 205, 244,  65, 129,  77,  82, 106, 220,  55, 200, 108, 193,
  171, 250,  36, 225, 123,   8,  12, 189, 177,  74, 120, 136, 149, 139,
  227,  99, 232, 109, 233, 203, 213, 254,  59,   0,  29,  57, 242, 239,
  183,  14, 102,  88, 208, 228, 166, 119, 114, 248, 235, 117,  75,  10,
   49,  68,  80, 180, 143, 237,  31,  26, 219, 153, 141,  51, 159,  17,
  131,  20
];

function md2Bytes(messageBytes: Uint8Array): Uint8Array {
  // Step 1: Append padding bytes
  // Pad so that length ≡ 0 (mod 16); padding value = number of bytes added (1–16)
  const padLen = 16 - (messageBytes.length % 16);
  const padded = new Uint8Array(messageBytes.length + padLen);
  padded.set(messageBytes);
  padded.fill(padLen, messageBytes.length);

  // Step 2: Append checksum (16 bytes)
  const checksum = new Uint8Array(16);
  let L = 0;
  for (let i = 0; i < padded.length / 16; i++) {
    for (let j = 0; j < 16; j++) {
      const c = padded[i * 16 + j];
      checksum[j] ^= S[c ^ L];
      L = checksum[j];
    }
  }
  const withChecksum = new Uint8Array(padded.length + 16);
  withChecksum.set(padded);
  withChecksum.set(checksum, padded.length);

  // Step 3: Initialize MD buffer (48 bytes)
  const X = new Uint8Array(48);

  // Step 4: Process each 16-byte block
  for (let i = 0; i < withChecksum.length / 16; i++) {
    // Copy block into X[16..31], X[32..47] = X[0..15] ^ block
    for (let j = 0; j < 16; j++) {
      const b = withChecksum[i * 16 + j];
      X[16 + j] = b;
      X[32 + j] = b ^ X[j];
    }

    // 18 rounds
    let t = 0;
    for (let r = 0; r < 18; r++) {
      for (let j = 0; j < 48; j++) {
        t = X[j] ^ S[t];
        X[j] = t;
      }
      t = (t + r) % 256;
    }
  }

  // Step 5: Output is X[0..15]
  return X.subarray(0, 16);
}

// Attach to CryptoJS namespace for compatibility with the MD2Tool component
(CryptoJS as any).MD2 = function (message: string) {
  const bytes = new TextEncoder().encode(message);
  const digest = md2Bytes(bytes);
  return {
    toString(): string {
      return Array.from(digest)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    },
  };
};

export default (CryptoJS as any).MD2;
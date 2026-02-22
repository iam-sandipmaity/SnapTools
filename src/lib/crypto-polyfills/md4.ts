import CryptoJS from 'crypto-js';

function leftRotate(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function toWords(buf: Uint8Array): number[] {
  const words: number[] = [];
  for (let i = 0; i < buf.length; i += 4) {
    words.push(
      ((buf[i]     || 0)        |
       ((buf[i + 1] || 0) << 8)  |
       ((buf[i + 2] || 0) << 16) |
       ((buf[i + 3] || 0) << 24)) >>> 0
    );
  }
  return words;
}

function md4Bytes(messageBytes: Uint8Array): Uint8Array {
  const msgLenBits = messageBytes.length * 8;

  // Padding: append 0x80, then zeros, then 64-bit LE length
  const withOne = new Uint8Array(messageBytes.length + 1);
  withOne.set(messageBytes);
  withOne[messageBytes.length] = 0x80;

  let paddedLen = withOne.length;
  while (paddedLen % 64 !== 56) paddedLen++;

  const padded = new Uint8Array(paddedLen + 8);
  padded.set(withOne);

  // Append original length in bits as 64-bit little-endian
  // JavaScript bitwise ops are 32-bit, so handle low/high 32 bits separately
  const lenLo = msgLenBits >>> 0;
  const lenHi = Math.floor(messageBytes.length / 0x20000000) >>> 0; // high 32 bits of bit-length
  for (let i = 0; i < 4; i++) padded[paddedLen + i]     = (lenLo >>> (8 * i)) & 0xff;
  for (let i = 0; i < 4; i++) padded[paddedLen + 4 + i] = (lenHi >>> (8 * i)) & 0xff;

  let A = 0x67452301;
  let B = 0xefcdab89;
  let C = 0x98badcfe;
  let D = 0x10325476;

  // Round index tables
  const R2_K = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
  const R3_K = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];

  for (let i = 0; i < padded.length; i += 64) {
    const X = toWords(padded.subarray(i, i + 64));

    const AA = A, BB = B, CC = C, DD = D;

    // Round 1: F(b,c,d) = (b & c) | (~b & d)
    // shifts: 3,7,11,19 cycling per group of 4
    const S1 = [3, 7, 11, 19];
    for (let j = 0; j < 16; j++) {
      const F = ((B & C) | (~B & D)) >>> 0;
      const tmp = leftRotate((A + F + X[j]) >>> 0, S1[j % 4]);
      A = D; D = C; C = B; B = tmp;
    }

    // Round 2: G(b,c,d) = (b & c) | (b & d) | (c & d)
    // shifts: 3,5,9,13 cycling per group of 4
    const S2 = [3, 5, 9, 13];
    for (let j = 0; j < 16; j++) {
      const G = ((B & C) | (B & D) | (C & D)) >>> 0;
      const tmp = leftRotate((A + G + X[R2_K[j]] + 0x5a827999) >>> 0, S2[j % 4]);
      A = D; D = C; C = B; B = tmp;
    }

    // Round 3: H(b,c,d) = b ^ c ^ d
    // shifts: 3,9,11,15 cycling per group of 4
    const S3 = [3, 9, 11, 15];
    for (let j = 0; j < 16; j++) {
      const H = (B ^ C ^ D) >>> 0;
      const tmp = leftRotate((A + H + X[R3_K[j]] + 0x6ed9eba1) >>> 0, S3[j % 4]);
      A = D; D = C; C = B; B = tmp;
    }

    A = (A + AA) >>> 0;
    B = (B + BB) >>> 0;
    C = (C + CC) >>> 0;
    D = (D + DD) >>> 0;
  }

  // Output digest in little-endian byte order
  const out = new Uint8Array(16);
  const words = [A, B, C, D];
  for (let i = 0; i < 4; i++) {
    out[i * 4]     =  words[i]        & 0xff;
    out[i * 4 + 1] = (words[i] >>>  8) & 0xff;
    out[i * 4 + 2] = (words[i] >>> 16) & 0xff;
    out[i * 4 + 3] = (words[i] >>> 24) & 0xff;
  }
  return out;
}

// Attach to CryptoJS namespace for compatibility with the MD4Tool component
(CryptoJS as any).MD4 = function (message: string) {
  const bytes = new TextEncoder().encode(message);
  const digest = md4Bytes(bytes);
  return {
    toString(): string {
      return Array.from(digest)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    },
  };
};

export default (CryptoJS as any).MD4;
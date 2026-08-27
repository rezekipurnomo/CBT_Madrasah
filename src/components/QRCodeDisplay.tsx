import React, { useMemo } from 'react';

// Pure Zero-Dependency QR Code Generator for URLs & Text
// Generates clean, crisp SVG QR Codes without requiring external npm packages

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
}

// Minimalist, robust pure TypeScript QR Code matrix generator (ISO/IEC 18004)
class QRMatrixGenerator {
  private static readonly GF256_EXP: number[] = new Array(512);
  private static readonly GF256_LOG: number[] = new Array(256);
  private static initialized = false;

  private static initGF() {
    if (this.initialized) return;
    let val = 1;
    for (let i = 0; i < 255; i++) {
      this.GF256_EXP[i] = val;
      this.GF256_LOG[val] = i;
      val <<= 1;
      if (val & 0x100) val ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      this.GF256_EXP[i] = this.GF256_EXP[i - 255];
    }
    this.initialized = true;
  }

  private static gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.GF256_EXP[this.GF256_LOG[a] + this.GF256_LOG[b]];
  }

  private static polyMul(p1: number[], p2: number[]): number[] {
    const res = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        res[i + j] ^= this.gfMul(p1[i], p2[j]);
      }
    }
    return res;
  }

  private static getGeneratorPoly(degree: number): number[] {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      poly = this.polyMul(poly, [1, this.GF256_EXP[i]]);
    }
    return poly;
  }

  private static calculateEC(data: number[], ecCount: number): number[] {
    const gen = this.getGeneratorPoly(ecCount);
    const msg = [...data, ...new Array(ecCount).fill(0)];
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= this.gfMul(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  // Determine minimal version needed for data length (1 to 6)
  private static getVersion(dataLen: number): { version: number; ecBytes: number; totalDataBytes: number } {
    // Capacity for EC Level M (Byte Mode)
    const capacities = [
      { version: 1, maxData: 14, ecBytes: 10, totalData: 16 },
      { version: 2, maxData: 26, ecBytes: 16, totalData: 28 },
      { version: 3, maxData: 42, ecBytes: 26, totalData: 44 },
      { version: 4, maxData: 62, ecBytes: 36, totalData: 64 },
      { version: 5, maxData: 84, ecBytes: 48, totalData: 86 },
      { version: 6, maxData: 106, ecBytes: 64, totalData: 108 },
    ];

    for (const cap of capacities) {
      if (dataLen <= cap.maxData) {
        return { version: cap.version, ecBytes: cap.ecBytes, totalDataBytes: cap.totalData };
      }
    }
    return { version: 6, ecBytes: 64, totalDataBytes: 108 };
  }

  public static generate(text: string): boolean[][] {
    this.initGF();
    const encoder = new TextEncoder();
    const utf8 = encoder.encode(text);
    const vInfo = this.getVersion(utf8.length);
    const version = vInfo.version;
    const size = version * 4 + 17;

    // Build data bitstream (Byte Mode: 0100)
    let bits = '0100';
    bits += utf8.length.toString(2).padStart(8, '0');
    for (const b of utf8) {
      bits += b.toString(2).padStart(8, '0');
    }
    // Add terminator (up to 4 zeroes)
    const maxBits = vInfo.totalDataBytes * 8;
    const termLen = Math.min(4, maxBits - bits.length);
    bits += '0'.repeat(termLen);
    // Pad to 8-bit boundary
    while (bits.length % 8 !== 0) {
      bits += '0';
    }
    // Pad bytes
    const padBytes = ['11101100', '00010001'];
    let padIdx = 0;
    while (bits.length < maxBits) {
      bits += padBytes[padIdx % 2];
      padIdx++;
    }

    // Convert bits to data bytes
    const dataBytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      dataBytes.push(parseInt(bits.substring(i, i + 8), 2));
    }

    // Calculate Error Correction codewords
    const ecBytes = this.calculateEC(dataBytes, vInfo.ecBytes);
    const allCodewords = [...dataBytes, ...ecBytes];

    // Initialize Matrix with undefined (false = light, true = dark, null = unplaced)
    const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
      new Array(size).fill(null)
    );
    const isFunction: boolean[][] = Array.from({ length: size }, () =>
      new Array(size).fill(false)
    );

    // Place Finder Patterns
    const placeFinder = (r: number, c: number) => {
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          const row = r + y;
          const col = c + x;
          if (row >= 0 && row < size && col >= 0 && col < size) {
            isFunction[row][col] = true;
            if (y === -1 || y === 7 || x === -1 || x === 7) {
              matrix[row][col] = false;
            } else if (y === 0 || y === 6 || x === 0 || x === 6) {
              matrix[row][col] = true;
            } else if (y >= 2 && y <= 4 && x >= 2 && x <= 4) {
              matrix[row][col] = true;
            } else {
              matrix[row][col] = false;
            }
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // Place Timing Patterns
    for (let i = 8; i < size - 8; i++) {
      if (!isFunction[6][i]) {
        matrix[6][i] = i % 2 === 0;
        isFunction[6][i] = true;
      }
      if (!isFunction[i][6]) {
        matrix[i][6] = i % 2 === 0;
        isFunction[i][6] = true;
      }
    }

    // Place Dark Module
    matrix[4 * version + 9][8] = true;
    isFunction[4 * version + 9][8] = true;

    // Place Alignment Patterns if version >= 2
    if (version >= 2) {
      const alignPos: Record<number, number[]> = {
        2: [6, 18],
        3: [6, 22],
        4: [6, 26],
        5: [6, 30],
        6: [6, 34],
      };
      const pos = alignPos[version] || [6, 18];
      for (const r of pos) {
        for (const c of pos) {
          // Skip if overlapping finder patterns
          if ((r === 6 && c === 6) || (r === 6 && c === pos[pos.length - 1]) || (r === pos[pos.length - 1] && c === 6)) {
            continue;
          }
          for (let y = -2; y <= 2; y++) {
            for (let x = -2; x <= 2; x++) {
              const row = r + y;
              const col = c + x;
              isFunction[row][col] = true;
              if (Math.abs(y) === 2 || Math.abs(x) === 2 || (y === 0 && x === 0)) {
                matrix[row][col] = true;
              } else {
                matrix[row][col] = false;
              }
            }
          }
        }
      }
    }

    // Reserve Format Information Area
    for (let i = 0; i < 9; i++) {
      if (i < size) {
        isFunction[8][i] = true;
        isFunction[i][8] = true;
      }
    }
    for (let i = 0; i < 8; i++) {
      isFunction[8][size - 1 - i] = true;
      isFunction[size - 1 - i][8] = true;
    }

    // Convert all codewords to bit stream
    let fullBits = '';
    for (const cw of allCodewords) {
      fullBits += cw.toString(2).padStart(8, '0');
    }

    // Place Data Bits in Matrix (zigzag from right to left)
    let bitIdx = 0;
    let right = size - 1;
    let goingUp = true;

    while (right > 0) {
      if (right === 6) right--; // Skip vertical timing pattern column

      for (let vertical = 0; vertical < size; vertical++) {
        const row = goingUp ? size - 1 - vertical : vertical;
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const col = right - colOffset;
          if (!isFunction[row][col]) {
            let bit = false;
            if (bitIdx < fullBits.length) {
              bit = fullBits[bitIdx] === '1';
              bitIdx++;
            }
            // Apply Standard Mask Pattern 0: (row + col) % 2 === 0
            if ((row + col) % 2 === 0) {
              bit = !bit;
            }
            matrix[row][col] = bit;
          }
        }
      }
      right -= 2;
      goingUp = !goingUp;
    }

    // Format Info for Level M (00), Mask 0 (000) -> 101010000010010 (BCH code with mask 101010000010010)
    // Precalculated format bits for EC M, Mask 0
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

    // Place Format Info
    for (let i = 0; i < 15; i++) {
      const b = formatBits[i] === 1;
      if (i <= 5) {
        matrix[8][i] = b;
      } else if (i === 6) {
        matrix[8][7] = b;
      } else if (i === 7) {
        matrix[8][8] = b;
      } else if (i === 8) {
        matrix[7][8] = b;
      } else {
        matrix[14 - i][8] = b;
      }

      if (i < 8) {
        matrix[size - 1 - i][8] = b;
      } else {
        matrix[8][size - 15 + i] = b;
      }
    }

    return matrix.map(row => row.map(cell => cell === true));
  }
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  size = 200,
  className = ''
}) => {
  const qrMatrix = useMemo(() => {
    if (!url) return null;
    try {
      return QRMatrixGenerator.generate(url);
    } catch {
      return null;
    }
  }, [url]);

  if (!url || !qrMatrix) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-white rounded-xl flex items-center justify-center p-3 shadow-md ${className}`}
      >
        <span className="text-xs text-neutral-500 font-mono">Menyiapkan QR...</span>
      </div>
    );
  }

  const matrixSize = qrMatrix.length;
  const margin = 2; // Quiet zone
  const totalGrid = matrixSize + margin * 2;

  return (
    <div
      className={`bg-white p-3 rounded-2xl shadow-md inline-block select-none ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        viewBox={`0 0 ${totalGrid} ${totalGrid}`}
        width={size}
        height={size}
        className="block mx-auto rounded-lg"
        shapeRendering="crispEdges"
      >
        <rect width={totalGrid} height={totalGrid} fill="#FFFFFF" />
        <g fill="#000000">
          {qrMatrix.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              cell ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx + margin}
                  y={rIdx + margin}
                  width="1"
                  height="1"
                />
              ) : null
            )
          )}
        </g>
      </svg>
    </div>
  );
};

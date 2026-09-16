/**
 * Geometria sona (lusona) — tradição Tchokwe.
 *
 * Gera a "esteira entrelaçada": uma linha a 45° que passa entre os pontos
 * de uma grelha m×n e ressalta nas margens, como um raio de luz entre
 * espelhos. Quando mdc(m, n) = 1 a linha é uma só e fecha sobre si mesma —
 * a regra que os desenhadores de sona seguiam na areia.
 */

export interface SonaGeometry {
  width: number;
  height: number;
  dots: Array<[number, number]>;
  path: string;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function lusona(cols: number, rows: number, spacing = 24, cornerRadius = 0.42): SonaGeometry {
  if (gcd(cols, rows) !== 1) {
    // Com mdc > 1 a figura parte-se em várias linhas; o sistema só usa linhas contínuas.
    throw new Error(`lusona: ${cols}×${rows} não produz uma linha contínua (mdc ≠ 1).`);
  }

  // Trajectória em unidades de grelha: parte da margem esquerda, entre a 1.ª e a 2.ª linha de pontos.
  const bounces: Array<[number, number]> = [];
  let x = 0;
  let y = 0.5;
  let dx = 1;
  let dy = 1;
  const start: [number, number] = [x, y];

  for (let guard = 0; guard < 4 * cols * rows + 8; guard++) {
    const tx = dx > 0 ? cols - x : x;
    const ty = dy > 0 ? rows - y : y;
    const t = Math.min(tx, ty);
    x += dx * t;
    y += dy * t;
    if (tx === t) dx = -dx;
    if (ty === t) dy = -dy;
    bounces.push([x, y]);
    if (Math.abs(x - start[0]) < 1e-9 && Math.abs(y - start[1]) < 1e-9 && dx === 1 && dy === 1) break;
  }

  const pad = spacing * 0.5;
  const px = ([bx, by]: [number, number]): [number, number] => [pad + bx * spacing, pad + by * spacing];
  const pts = bounces.map(px); // o último ponto coincide com o de partida
  const r = spacing * cornerRadius;
  const n = pts.length;

  const toward = (from: [number, number], to: [number, number], dist: number): [number, number] => {
    const vx = to[0] - from[0];
    const vy = to[1] - from[1];
    const len = Math.hypot(vx, vy) || 1;
    return [from[0] + (vx / len) * dist, from[1] + (vy / len) * dist];
  };
  const f = (p: [number, number]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

  // Começa a meio do primeiro segmento para que todos os ressaltos fiquem arredondados.
  const first = pts[n - 1];
  const second = pts[0];
  const mid: [number, number] = [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2];
  let d = `M ${f(mid)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = i === 0 ? pts[n - 1] : pts[i - 1];
    const next = pts[(i + 1) % n];
    d += ` L ${f(toward(p, prev, r))} Q ${f(p)} ${f(toward(p, next, r))}`;
  }
  d += ' Z';

  const dots: Array<[number, number]> = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) dots.push(px([i + 0.5, j + 0.5]));
  }

  return { width: cols * spacing + pad * 2, height: rows * spacing + pad * 2, dots, path: d };
}

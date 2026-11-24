import React, { useMemo, useState } from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, CircleDot } from 'lucide-react';
import { MathFormula } from '../MathRenderer';
import { TranslatedText } from '../TranslatedText';

export const QuadraticVisualizer: React.FC = () => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);

  const discriminant = b * b - 4 * a * c;
  const vertexX = a !== 0 ? -b / (2 * a) : 0;
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  const roots = useMemo(() => {
    if (a === 0 || discriminant < 0) return [];
    if (Math.abs(discriminant) < 1e-9) return [-b / (2 * a)];
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b - sqrtD) / (2 * a);
    const r2 = (-b + sqrtD) / (2 * a);
    return [Math.min(r1, r2), Math.max(r1, r2)];
  }, [a, b, c, discriminant]);

  const width = 420;
  const height = 340;
  const xMin = -8;
  const xMax = 8;
  const yMin = -9;
  const yMax = 9;

  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toSvgY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  const pathD = useMemo(() => {
    const pts: string[] = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = a * x * x + b * x + c;
      const sx = toSvgX(x);
      const sy = toSvgY(y);
      pts.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [a, b, c]);

  const fmtTerm = (coef: number, suffix: string) => {
    if (coef === 0) return '';
    const sign = coef > 0 ? '+' : '-';
    const abs = Math.abs(coef);
    if (suffix && abs === 1) return `${sign} ${suffix}`;
    return `${sign} ${abs}${suffix}`;
  };

  const eqLatex = `y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${fmtTerm(b, 'x')} ${fmtTerm(c, '')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            <TranslatedText text="Interactive Quadratic Parabola & Discriminant Explorer" />
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            <TranslatedText text="Vary a, b, and c to see how the discriminant predicts the number of real roots and x-intercepts." />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setA(1);
              setB(-2);
              setC(-3);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            2 Roots (Δ &gt; 0)
          </button>
          <button
            type="button"
            onClick={() => {
              setA(1);
              setB(-4);
              setC(4);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            1 Root (Δ = 0)
          </button>
          <button
            type="button"
            onClick={() => {
              setA(1);
              setB(2);
              setC(3);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            0 Roots (Δ &lt; 0)
          </button>
          <button
            type="button"
            onClick={() => {
              setA(1);
              setB(-2);
              setC(-3);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto block"
            role="img"
            aria-label="Parabola graph showing vertex, axis of symmetry, and real roots"
          >
            {Array.from({ length: 17 }, (_, i) => i - 8).map((val) => (
              <line
                key={`xgrid-${val}`}
                x1={toSvgX(val)}
                y1={0}
                x2={toSvgX(val)}
                y2={height}
                stroke={val === 0 ? '#64748B' : '#E2E8F0'}
                strokeWidth={val === 0 ? 1.5 : 1}
              />
            ))}
            {Array.from({ length: 19 }, (_, i) => i - 9).map((val) => (
              <line
                key={`ygrid-${val}`}
                x1={0}
                y1={toSvgY(val)}
                x2={width}
                y2={toSvgY(val)}
                stroke={val === 0 ? '#64748B' : '#E2E8F0'}
                strokeWidth={val === 0 ? 1.5 : 1}
              />
            ))}

            {[-6, -4, -2, 2, 4, 6].map((val) => (
              <React.Fragment key={`qlbl-${val}`}>
                <text
                  x={toSvgX(val)}
                  y={toSvgY(0) + 13}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                >
                  {val}
                </text>
                <text
                  x={toSvgX(0) - 9}
                  y={toSvgY(val) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748B"
                >
                  {val}
                </text>
              </React.Fragment>
            ))}

            {/* Axis of symmetry */}
            {a !== 0 && (
              <line
                x1={toSvgX(vertexX)}
                y1={0}
                x2={toSvgX(vertexX)}
                y2={height}
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            )}

            {/* Parabola path */}
            <path d={pathD} fill="none" stroke="#2563EB" strokeWidth={2.75} />

            {/* Vertex marker */}
            {a !== 0 && Math.abs(vertexX) <= 8 && Math.abs(vertexY) <= 9 && (
              <circle
                cx={toSvgX(vertexX)}
                cy={toSvgY(vertexY)}
                r={5}
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth={1.75}
              />
            )}

            {/* Real roots */}
            {roots.map((r, i) =>
              Math.abs(r) <= 8 ? (
                <circle
                  key={`root-${i}`}
                  cx={toSvgX(r)}
                  cy={toSvgY(0)}
                  r={5.5}
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ) : null
            )}
          </svg>

          <div className="flex flex-wrap items-center gap-5 mt-3 px-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] inline-block" />
              Vertex: ({vertexX.toFixed(2).replace(/\.00$/, '')}, {vertexY.toFixed(2).replace(/\.00$/, '')})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
              Real Roots (x-intercepts):{' '}
              {roots.length === 0
                ? 'None'
                : roots.map((r) => r.toFixed(2).replace(/\.00$/, '')).join(', ')}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4">
            <div className="text-xs font-medium text-slate-500 mb-1">
              Quadratic Function
            </div>
            <div className="text-lg font-semibold text-[#0F172A]">
              <MathFormula latex={eqLatex} />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Coefficient a (opens {a > 0 ? 'upward' : 'downward'})</span>
                <span className="font-mono-tabular text-blue-700">{a}</span>
              </div>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.5}
                value={a}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setA(val === 0 ? 0.5 : val);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Coefficient b</span>
                <span className="font-mono-tabular text-blue-700">{b}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Constant c (y-intercept)</span>
                <span className="font-mono-tabular text-blue-700">{c}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={c}
                onChange={(e) => setC(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Discriminant (b² − 4ac)</span>
              <span className="font-mono-tabular font-semibold text-sm text-[#0F172A]">
                {discriminant.toFixed(2).replace(/\.00$/, '')}
              </span>
            </div>

            {discriminant > 0 && (
              <div className="flex items-start gap-2 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>2 Distinct Real Solutions (crosses x-axis twice)</span>
              </div>
            )}
            {Math.abs(discriminant) < 1e-9 && (
              <div className="flex items-start gap-2 text-blue-700 text-sm">
                <CircleDot className="w-4 h-4 shrink-0 mt-0.5" />
                <span>1 Real Solution (vertex touches the x-axis)</span>
              </div>
            )}
            {discriminant < 0 && (
              <div className="flex items-start gap-2 text-rose-700 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>0 Real Solutions (no x-intercepts)</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Vieta Sum (−b/a)</span>
                <span className="font-mono-tabular font-semibold text-[#0F172A]">
                  {(-b / a).toFixed(2).replace(/\.00$/, '')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Vieta Product (c/a)</span>
                <span className="font-mono-tabular font-semibold text-[#0F172A]">
                  {(c / a).toFixed(2).replace(/\.00$/, '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

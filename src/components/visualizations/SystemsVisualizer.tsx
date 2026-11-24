import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';
import { MathFormula } from '../MathRenderer';
import { TranslatedText } from '../TranslatedText';

export const SystemsVisualizer: React.FC = () => {
  const [m1, setM1] = useState(1);
  const [b1, setB1] = useState(1);
  const [m2, setM2] = useState(-1);
  const [b2, setB2] = useState(5);

  // Solve m1*x + b1 = m2*x + b2
  const slopeDiff = m1 - m2;
  const interceptDiff = b2 - b1;

  let systemType: 'unique' | 'parallel' | 'coincident' = 'unique';
  let ix: number | null = null;
  let iy: number | null = null;

  if (Math.abs(slopeDiff) < 0.001) {
    systemType = Math.abs(interceptDiff) < 0.001 ? 'coincident' : 'parallel';
  } else {
    ix = interceptDiff / slopeDiff;
    iy = m1 * ix + b1;
  }

  const width = 420;
  const height = 340;
  const xMin = -8;
  const xMax = 8;
  const yMin = -8;
  const yMax = 8;

  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toSvgY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  const fmtSigned = (n: number) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            <TranslatedText text="Interactive System of Equations Visualizer" />
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            <TranslatedText text="Change the slope and y-intercept of each line to observe the point of intersection." />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setM1(1);
              setB1(1);
              setM2(-1);
              setB2(5);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Intersecting
          </button>
          <button
            type="button"
            onClick={() => {
              setM1(1.5);
              setB1(2);
              setM2(1.5);
              setB2(-3);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Parallel
          </button>
          <button
            type="button"
            onClick={() => {
              setM1(0.5);
              setB1(2);
              setM2(0.5);
              setB2(2);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Same Line
          </button>
          <button
            type="button"
            onClick={() => {
              setM1(1);
              setB1(1);
              setM2(-1);
              setB2(5);
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
            aria-label="Coordinate plane showing two linear equations"
          >
            {Array.from({ length: 17 }, (_, i) => i - 8).map((val) => (
              <React.Fragment key={val}>
                <line
                  x1={toSvgX(val)}
                  y1={0}
                  x2={toSvgX(val)}
                  y2={height}
                  stroke={val === 0 ? '#64748B' : '#E2E8F0'}
                  strokeWidth={val === 0 ? 1.5 : 1}
                />
                <line
                  x1={0}
                  y1={toSvgY(val)}
                  x2={width}
                  y2={toSvgY(val)}
                  stroke={val === 0 ? '#64748B' : '#E2E8F0'}
                  strokeWidth={val === 0 ? 1.5 : 1}
                />
              </React.Fragment>
            ))}

            {[-6, -4, -2, 2, 4, 6].map((val) => (
              <React.Fragment key={`sys-lbl-${val}`}>
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
                  x={toSvgX(0) - 10}
                  y={toSvgY(val) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748B"
                >
                  {val}
                </text>
              </React.Fragment>
            ))}

            {/* Line 1 */}
            <line
              x1={toSvgX(xMin)}
              y1={toSvgY(m1 * xMin + b1)}
              x2={toSvgX(xMax)}
              y2={toSvgY(m1 * xMax + b1)}
              stroke="#2563EB"
              strokeWidth={2.5}
            />

            {/* Line 2 */}
            <line
              x1={toSvgX(xMin)}
              y1={toSvgY(m2 * xMin + b2)}
              x2={toSvgX(xMax)}
              y2={toSvgY(m2 * xMax + b2)}
              stroke="#D97706"
              strokeWidth={2.5}
              strokeDasharray={systemType === 'coincident' ? '7 4' : undefined}
            />

            {/* Intersection */}
            {systemType === 'unique' &&
              ix !== null &&
              iy !== null &&
              Math.abs(ix) <= 8 &&
              Math.abs(iy) <= 8 && (
                <>
                  <circle
                    cx={toSvgX(ix)}
                    cy={toSvgY(iy)}
                    r={6}
                    fill="#DC2626"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <rect
                    x={Math.min(Math.max(toSvgX(ix) - 42, 6), width - 90)}
                    y={Math.max(toSvgY(iy) - 30, 8)}
                    width={84}
                    height={21}
                    rx={4}
                    fill="#0F172A"
                  />
                  <text
                    x={Math.min(Math.max(toSvgX(ix), 48), width - 48)}
                    y={Math.max(toSvgY(iy) - 16, 22)}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="600"
                    fill="#FFFFFF"
                  >
                    ({ix.toFixed(1).replace(/\.0$/, '')}, {iy.toFixed(1).replace(/\.0$/, '')})
                  </text>
                </>
              )}
          </svg>

          <div className="flex flex-wrap items-center gap-5 mt-3 px-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#2563EB] inline-block" />
              Line 1: <MathFormula latex={`y = ${m1}x ${fmtSigned(b1)}`} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#D97706] inline-block" />
              Line 2: <MathFormula latex={`y = ${m2}x ${fmtSigned(b2)}`} />
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-3">
            <div className="text-xs font-semibold text-blue-700">Line 1 Parameters</div>
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>Slope (m₁)</span>
                <span className="font-mono-tabular">{m1}</span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.5}
                value={m1}
                onChange={(e) => setM1(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>y-intercept (b₁)</span>
                <span className="font-mono-tabular">{b1}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={b1}
                onChange={(e) => setB1(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] space-y-3">
            <div className="text-xs font-semibold text-amber-700">Line 2 Parameters</div>
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>Slope (m₂)</span>
                <span className="font-mono-tabular">{m2}</span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.5}
                value={m2}
                onChange={(e) => setM2(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>y-intercept (b₂)</span>
                <span className="font-mono-tabular">{b2}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={b2}
                onChange={(e) => setB2(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            {systemType === 'unique' && ix !== null && iy !== null && (
              <div className="flex items-start gap-2 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">1 Unique Solution</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Slopes differ ({m1} ≠ {m2}). The lines intersect at{' '}
                    <span className="font-mono-tabular font-semibold text-[#0F172A]">
                      ({ix.toFixed(2).replace(/\.00$/, '')},{' '}
                      {iy.toFixed(2).replace(/\.00$/, '')})
                    </span>
                    .
                  </div>
                </div>
              </div>
            )}
            {systemType === 'parallel' && (
              <div className="flex items-start gap-2 text-rose-700 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">No Solution (Parallel Lines)</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Equal slopes ({m1} = {m2}) with different y-intercepts ({b1} ≠ {b2}).
                  </div>
                </div>
              </div>
            )}
            {systemType === 'coincident' && (
              <div className="flex items-start gap-2 text-blue-700 text-sm">
                <InfinityIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Infinitely Many Solutions</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Equal slopes ({m1} = {m2}) and equal y-intercepts ({b1} = {b2}).
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

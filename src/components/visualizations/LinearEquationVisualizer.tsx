import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';
import { MathFormula } from '../MathRenderer';
import { TranslatedText } from '../TranslatedText';

export const LinearEquationVisualizer: React.FC = () => {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(0.5);
  const [d, setD] = useState(2);

  // Equation: a*x + b = c*x + d  =>  (a - c)*x = d - b
  const diffCoeff = Number((a - c).toFixed(2));
  const diffConst = Number((d - b).toFixed(2));

  let status: 'unique' | 'none' | 'infinite' = 'unique';
  let solutionX: number | null = null;
  let solutionY: number | null = null;

  if (Math.abs(diffCoeff) < 0.001) {
    if (Math.abs(diffConst) < 0.001) {
      status = 'infinite';
    } else {
      status = 'none';
    }
  } else {
    solutionX = diffConst / diffCoeff;
    solutionY = a * solutionX + b;
  }

  // Coordinate mapping: x in [-8, 8], y in [-8, 8]
  const width = 420;
  const height = 340;
  const xMin = -8;
  const xMax = 8;
  const yMin = -8;
  const yMax = 8;

  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toSvgY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  const line1Start = { x: toSvgX(xMin), y: toSvgY(a * xMin + b) };
  const line1End = { x: toSvgX(xMax), y: toSvgY(a * xMax + b) };

  const line2Start = { x: toSvgX(xMin), y: toSvgY(c * xMin + d) };
  const line2End = { x: toSvgX(xMax), y: toSvgY(c * xMax + d) };

  const formatSigned = (n: number) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`);

  const handleReset = () => {
    setA(2);
    setB(-1);
    setC(0.5);
    setD(2);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            <TranslatedText text="Interactive Linear Equation Explorer" />
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            <TranslatedText text="Adjust the coefficients on both sides to see when the equation has one, zero, or infinitely many solutions." />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setA(2);
              setB(-2);
              setC(0.5);
              setD(1);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            One Solution
          </button>
          <button
            type="button"
            onClick={() => {
              setA(1.5);
              setB(3);
              setC(1.5);
              setD(-2);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            No Solution
          </button>
          <button
            type="button"
            onClick={() => {
              setA(1);
              setB(2);
              setC(1);
              setD(2);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Infinite
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coordinate Plane SVG */}
        <div className="lg:col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto block"
            role="img"
            aria-label="Graph of left side y = ax + b and right side y = cx + d"
          >
            {/* Grid lines */}
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

            {/* Axis numbers */}
            {[-6, -4, -2, 2, 4, 6].map((val) => (
              <React.Fragment key={`lbl-${val}`}>
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

            {/* Left side y = ax + b */}
            <line
              x1={line1Start.x}
              y1={line1Start.y}
              x2={line1End.x}
              y2={line1End.y}
              stroke="#2563EB"
              strokeWidth={2.5}
            />

            {/* Right side y = cx + d */}
            <line
              x1={line2Start.x}
              y1={line2Start.y}
              x2={line2End.x}
              y2={line2End.y}
              stroke="#0D9488"
              strokeWidth={2.5}
              strokeDasharray={status === 'infinite' ? '6 4' : undefined}
            />

            {/* Intersection projection to x-axis */}
            {status === 'unique' &&
              solutionX !== null &&
              solutionY !== null &&
              Math.abs(solutionX) <= 8 &&
              Math.abs(solutionY) <= 8 && (
                <>
                  <line
                    x1={toSvgX(solutionX)}
                    y1={toSvgY(solutionY)}
                    x2={toSvgX(solutionX)}
                    y2={toSvgY(0)}
                    stroke="#DC2626"
                    strokeWidth={1.25}
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={toSvgX(solutionX)}
                    cy={toSvgY(solutionY)}
                    r={5.5}
                    fill="#DC2626"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <rect
                    x={Math.min(Math.max(toSvgX(solutionX) - 34, 6), width - 74)}
                    y={Math.max(toSvgY(solutionY) - 28, 8)}
                    width={68}
                    height={20}
                    rx={4}
                    fill="#0F172A"
                  />
                  <text
                    x={Math.min(Math.max(toSvgX(solutionX), 40), width - 40)}
                    y={Math.max(toSvgY(solutionY) - 14, 22)}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="600"
                    fill="#FFFFFF"
                  >
                    x = {solutionX.toFixed(2).replace(/\.00$/, '')}
                  </text>
                </>
              )}
          </svg>

          <div className="flex flex-wrap items-center gap-5 mt-3 px-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#2563EB] inline-block" />
              Left side: <MathFormula latex={`y = ${a}x ${formatSigned(b)}`} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#0D9488] inline-block" />
              Right side: <MathFormula latex={`y = ${c}x ${formatSigned(d)}`} />
            </span>
          </div>
        </div>

        {/* Controls & Algebraic Steps */}
        <div className="lg:col-span-5 space-y-5">
          {/* Equation display */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4">
            <div className="text-xs font-medium text-slate-500 mb-1.5">
              Current Equation
            </div>
            <div className="text-lg font-semibold text-[#0F172A]">
              <MathFormula
                latex={`${a}x ${formatSigned(b)} = ${c}x ${formatSigned(d)}`}
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Left x-coefficient (a)</span>
                <span className="font-mono-tabular text-blue-700">{a}</span>
              </div>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.5}
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Left constant (b)</span>
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
                <span>Right x-coefficient (c)</span>
                <span className="font-mono-tabular text-teal-700">{c}</span>
              </div>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.5}
                value={c}
                onChange={(e) => setC(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Right constant (d)</span>
                <span className="font-mono-tabular text-teal-700">{d}</span>
              </div>
              <input
                type="range"
                min={-6}
                max={6}
                step={1}
                value={d}
                onChange={(e) => setD(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Solution Outcome */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Algebraic Simplification
            </div>
            <div className="text-sm text-slate-700 font-mono-tabular">
              ({a} - {c})x = {d} - ({b}) &nbsp;→&nbsp; {diffCoeff}x = {diffConst}
            </div>

            {status === 'unique' && solutionX !== null && (
              <div className="flex items-start gap-2 pt-1 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Exactly 1 Solution: <span className="font-mono-tabular">x = {solutionX.toFixed(2).replace(/\.00$/, '')}</span>
                </span>
              </div>
            )}
            {status === 'none' && (
              <div className="flex items-start gap-2 pt-1 text-rose-700 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No Solution (0 = {diffConst} is false; parallel lines never meet)
                </span>
              </div>
            )}
            {status === 'infinite' && (
              <div className="flex items-start gap-2 pt-1 text-blue-700 text-sm font-medium">
                <InfinityIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Infinitely Many Solutions (0 = 0 is always true; identical lines)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

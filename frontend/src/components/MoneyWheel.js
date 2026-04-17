import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const formatMoney = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val.toLocaleString()}`;
};

export default function MoneyWheel({ secured = 0, potential = 0 }) {
  const remaining = Math.max(potential - secured, 0);
  const data = secured > 0
    ? [{ name: "Secured", value: secured }, { name: "Potential", value: remaining }]
    : [{ name: "Potential", value: potential || 1 }];

  const COLORS = secured > 0 ? ["#10B981", "#E2E8F0"] : ["#F59E0B"];

  return (
    <div className="flex flex-col items-center justify-center w-full" data-testid="money-wheel">
      <div className="relative w-52 h-52 sm:w-60 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="90%"
              paddingAngle={secured > 0 ? 4 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-1 font-['Outfit']">
            {secured > 0 ? "Secured" : "Potential"}
          </span>
          <span className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-slate-900" data-testid="money-wheel-amount">
            {formatMoney(secured > 0 ? secured : potential)}
          </span>
          {secured > 0 && potential > 0 && (
            <span className="text-xs text-slate-400 mt-1">of {formatMoney(potential)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">Secured {formatMoney(secured)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-slate-500">Potential {formatMoney(potential)}</span>
        </div>
      </div>
    </div>
  );
}

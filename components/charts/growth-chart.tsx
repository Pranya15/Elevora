"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GrowthEntry } from "@/lib/types";
export function GrowthChart({ entries }: { entries: GrowthEntry[] }) {
  const data = [...entries]
    .slice(0, 6)
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      rating: entry.rating,
      title: entry.title
    }));

  if (data.length === 0) {
    return <p className="text-sm text-muted">Add entries to unlock growth analytics.</p>;
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 5]} stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(12,12,12,0.92)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 18
            }}
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value: number, _name, item) => [`${value}/5`, item.payload.title]}
          />
          <Line type="monotone" dataKey="rating" stroke="currentColor" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

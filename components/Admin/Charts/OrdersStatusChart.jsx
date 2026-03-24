"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
      <p className="text-sm text-gray-600">{payload[0].value} orders</p>
    </div>
  );
}

export default function OrdersStatusChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-gray-500">No order data yet</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

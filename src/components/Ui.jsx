import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function Metric({ value, label, icon }) {
  return <div className="metric"><div className="metricIcon">{icon}</div><b>{value}</b><span>{label}</span></div>
}

export function Field({ label, value, onChange }) {
  return <div><label>{label}</label><input value={value} onChange={e => onChange(e.target.value)} /></div>
}

export function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
}

export function Chart({ data }) {
  if (!data?.length) return <p className="muted">No chart data yet.</p>
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 12 }} />
          <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={4} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

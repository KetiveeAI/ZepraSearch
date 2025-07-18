import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const dayOptions = [7, 14, 30, 90];

const SearchSpikeGraph = ({ defaultDays = 30, defaultUserId = '' }) => {
  const [data, setData] = useState([]);
  const [days, setDays] = useState(defaultDays);
  const [userId, setUserId] = useState(defaultUserId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let url = `/api/analytics/daily-search-counts?days=${days}`;
    if (userId && userId.trim()) {
      url += `&userId=${encodeURIComponent(userId.trim())}`;
    }
    setLoading(true);
    setError('');
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(json => setData(json.dailyCounts || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [days, userId]);

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', background: '#181c24', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px #0008', marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18, gap: 16 }}>
        <h3 style={{ color: 'white', margin: 0, flex: 1 }}>User Search Spikes</h3>
        <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ background: '#23293a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px' }}>
          {dayOptions.map(opt => <option key={opt} value={opt}>{opt} days</option>)}
        </select>
        <input
          type="text"
          placeholder="User ID (optional)"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ background: '#23293a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', minWidth: 120 }}
        />
      </div>
      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#ff4d4d', textAlign: 'center', padding: 40 }}>{error}</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#aaa" tick={{ fontSize: 12 }} angle={-20} dy={10} />
            <YAxis stroke="#aaa" allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#23293a', border: 'none', color: '#fff' }} labelStyle={{ color: '#fff' }} />
            <CartesianGrid stroke="#23293a" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="count" stroke="#00c9a7" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SearchSpikeGraph;

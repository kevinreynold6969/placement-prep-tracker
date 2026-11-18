import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';
import EmptyState from '../common/EmptyState';

const DIFFICULTY_COLORS = {
  Easy: 'var(--theme-primary)',
  Medium: 'var(--theme-accent)',
  Hard: 'var(--theme-ink)',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-panel border border-line text-xs shadow-xl space-y-1">
        <p className="font-bold text-ink">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <strong className="font-mono">{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ analytics, totalProblems = 0 }) => {
  if (!analytics || totalProblems === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available Yet"
          description="Analytics charts are generated dynamically from your recorded problem attempts. Start by logging your practice problems to view your progress metrics."
        />
      </div>
    );
  }

  const { topicBreakdown = [], difficultyBreakdown = [], activityOverTime = [] } = analytics;

  // Filter topics that have at least 1 problem recorded
  const activeTopics = topicBreakdown.filter((t) => t.total > 0);

  // Prepare difficulty data for Pie Chart
  const pieData = (difficultyBreakdown || []).map((d) => ({
    name: d.difficulty,
    value: d.total,
    color: DIFFICULTY_COLORS[d.difficulty] || '#ffd5ca',
  }));

  return (
    <div className="space-y-8">
      {/* Row 1: Topic Breakdown & Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Breakdown Bar Chart */}
        <div className="lg:col-span-2 neo-card p-6 bg-panel space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-punk-500" />
                Problem Completion by Topic
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Distribution of Solved, Attempted, and Revision problems across topics
              </p>
            </div>
          </div>

          {activeTopics.length > 0 ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeTopics} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="topic"
                    stroke="var(--theme-chart-grid)"
                    tick={{ fill: 'var(--theme-chart-text)', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="var(--theme-chart-grid)" tick={{ fill: 'var(--theme-chart-text)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--theme-accent)', fillOpacity: 0.12 }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--theme-ink)' }} />
                  <Bar dataKey="solved" name="Solved" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attempted" name="Attempted" fill="var(--theme-accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="needsRevision" name="Needs Revision" fill="var(--theme-ink)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-subtle">
              No topic attempts recorded yet.
            </div>
          )}
        </div>

        {/* Difficulty Pie Chart */}
        <div className="neo-card p-6 bg-panel space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-punk-500" />
                Difficulty Breakdown
              </h3>
              <p className="text-xs text-muted mt-0.5">Easy vs Medium vs Hard distribution</p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--theme-ink)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-line/60">
            {pieData.map((d) => (
              <div key={d.name} className="p-2 rounded-lg bg-paper border border-line">
                <span className="text-[10px] text-muted font-mono block">{d.name}</span>
                <span className="font-bold text-ink text-sm mt-0.5 block">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Activity Over Time */}
      <div className="neo-card p-6 bg-panel space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-punk-500" />
              Preparation Velocity (Past 30 Days)
            </h3>
            <p className="text-xs text-muted mt-0.5">Problems recorded day by day</p>
          </div>
        </div>

        {activityOverTime.length > 0 ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityOverTime} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--theme-chart-grid)" tick={{ fill: 'var(--theme-chart-text)', fontSize: 11 }} />
                <YAxis stroke="var(--theme-chart-grid)" tick={{ fill: 'var(--theme-chart-text)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--theme-ink)' }} />
                <Line
                  type="monotone"
                  dataKey="added"
                  name="Problems Recorded"
                  stroke="var(--theme-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--theme-primary)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="solved"
                  name="Problems Solved"
                  stroke="var(--theme-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--theme-accent)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-subtle">
            No activity logged in the selected timeframe.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;

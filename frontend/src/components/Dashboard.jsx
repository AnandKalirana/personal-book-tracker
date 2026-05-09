import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ stats }) => {
  const [timeRange, setTimeRange] = useState('all'); // 'month' or 'all'

  if (!stats) return null;

  // Data for Status Pie Chart
  const statusData = [
    { name: 'Completed', value: stats.books_completed || 0 },
    { name: 'Reading', value: stats.books_reading || 0 },
    { name: 'Wishlist', value: stats.books_wishlist || 0 },
  ].filter(item => item.value > 0);

  const STATUS_COLORS = ['#10b981', '#6366f1', '#f59e0b'];

  // Genre data calculation for the new UI
  const totalBooks = stats.total_books || 1;
  const genreList = stats.genres?.length > 0 
    ? stats.genres.map((g, idx) => ({
        ...g,
        percentage: Math.round((g.count / totalBooks) * 100),
        color: ['#f43f5e', '#14b8a6', '#8b5cf6', '#f97316', '#334155'][idx % 5]
      }))
    : [];

  return (
    <div className="dashboard-container">
      {/* Quick Stats Header */}
      <div className="stats-header-grid">
        <div className="header-stat-card">
          <span className="stat-label">Total Books</span>
          <h2 className="stat-value">{stats.total_books || 0}</h2>
        </div>
        <div className="header-stat-card">
          <span className="stat-label">Pages Read</span>
          <h2 className="stat-value">{stats.total_pages_read?.toLocaleString() || 0}</h2>
        </div>
        <div className="header-stat-card">
          <span className="stat-label">Avg Rating</span>
          <h2 className="stat-value">{stats.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0'}</h2>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Top Genres - CUSTOM UI FROM IMAGE */}
        <div className="genres-card">
          <div className="genres-header">
            <div className="genres-title-group">
              <span className="badge-analytics">ANALYTICS</span>
              <h2 className="genres-title">Top Genres</h2>
              <p className="genres-subtitle">Visualizing reader engagement across literary categories</p>
            </div>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Current Month
              </button>
              <button 
                className={`toggle-btn ${timeRange === 'all' ? 'active' : ''}`}
                onClick={() => setTimeRange('all')}
              >
                All Time
              </button>
            </div>
          </div>

          <div className="genres-list">
            {genreList.map((genre, index) => (
              <div key={index} className="genre-item">
                <div className="genre-info">
                  <div className="genre-meta">
                    <span className="genre-index">0{index + 1}</span>
                    <span className="genre-name">{genre.genre} {index === 0 && <span className="trend-up">↗</span>}</span>
                  </div>
                  <span className="genre-percentage">{genre.percentage}%</span>
                </div>
                <div className="genre-progress-bg">
                  <div 
                    className="genre-progress-fill" 
                    style={{ width: `${genre.percentage}%`, backgroundColor: genre.color }}
                  ></div>
                </div>
              </div>
            ))}
            {genreList.length === 0 && <p className="no-data">No genre data available yet.</p>}
          </div>
        </div>

        {/* Secondary Charts Container */}
        <div className="secondary-charts">
          {/* Status Distribution */}
          <div className="chart-card-small">
            <h4 className="chart-card-title">Reading Status</h4>
            <div className="chart-h-200">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reading Trends */}
          <div className="chart-card-small">
            <h4 className="chart-card-title">Monthly Trends</h4>
            <div className="chart-h-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trends || []}>
                  <XAxis dataKey="month" hide />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import api from '../api';
import { Pie, Bar } from 'react-chartjs-2';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await api.get('/expenses');
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Group by category for Pie Chart
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
      ],
      borderWidth: 1,
    }]
  };

  const anomaliesCount = expenses.filter(e => e.isAnomaly).length;

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-primary">
          <p className="text-sm font-medium text-gray-500">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-secondary">
          <p className="text-sm font-medium text-gray-500">Transactions</p>
          <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Anomalies Detected</p>
          <p className="text-3xl font-bold text-red-600 flex items-center">
            {anomaliesCount} {anomaliesCount > 0 && <ArrowTrendingUpIcon className="w-6 h-6 ml-2" />}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Spending by Category</h2>
          {expenses.length > 0 ? (
            <div className="h-64 flex justify-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No data available for chart</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {expenses.slice(0, 5).map(exp => (
              <div key={exp._id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0 border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{exp.description}</p>
                  <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()} &bull; {exp.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{exp.amount.toFixed(2)}</p>
                  {exp.isAnomaly && <span className="text-xs text-red-500 font-bold bg-red-100 px-2 py-1 rounded">Suspicious</span>}
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-gray-500 text-center">No recent transactions</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import '../index.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import AdminProfiePhoto from "../media/Admin_placeholder.jpg";

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Test data
  const testComplaints = [
    {
      id: '1',
      title: 'Wi-Fi not working',
      description: 'The campus Wi-Fi is down in the library.',
      status: 'unresolved',
      category: 'IT support',
      priority: 'high',
      submittedOn: '2025-01-01',
      userId: 'user1',
      feedback: null,
    },
    {
      id: '2',
      title: 'Broken Projector',
      description: 'The projector in Room 101 is not functioning.',
      status: 'resolved',
      category: 'facilities',
      priority: 'medium',
      submittedOn: '2025-01-02',
      userId: 'user2',
      feedback: 'Issue resolved. New projector installed.',
    },
  ];

  const testUsers = {
    user1: { email: 'student1@example.com' },
    user2: { email: 'faculty1@example.com' },
  };

  const testSuggestions = [
    {
      id: '1',
      title: 'Add more charging ports',
      description: 'Charging ports in the library are insufficient.',
      submittedOn: '2025-01-03',
    },
  ];

  const [filteredComplaints, setFilteredComplaints] = useState(testComplaints);

  const handleSearch = () => {
    let filtered = testComplaints;

    if (searchQuery) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(complaint => complaint.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterCategory) {
      filtered = filtered.filter(complaint =>
        complaint.category && complaint.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    if (filterPriority) {
      filtered = filtered.filter(complaint => complaint.priority.toLowerCase() === filterPriority.toLowerCase());
    }

    setFilteredComplaints(filtered);
  };

  const chartDataStatus = {
    labels: ['Resolved', 'Unresolved'],
    datasets: [
      {
        data: [
          testComplaints.filter(complaint => complaint.status === 'resolved').length,
          testComplaints.filter(complaint => complaint.status === 'unresolved').length,
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center mt-4 sm:mt-0">
            <img
              src={AdminProfiePhoto}
              alt="Admin Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
            <div className="ml-4">
              <h2 className="font-semibold text-lg">Admin User</h2>
              <p className="text-gray-500 text-sm">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Stats Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Complaint Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow">
            <h4 className="text-sm text-gray-600">Total Complaints</h4>
            <p className="text-lg font-bold">{testComplaints.length}</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow">
            <h4 className="text-sm text-gray-600">Resolved Complaints</h4>
            <p className="text-lg font-bold">{testComplaints.filter(complaint => complaint.status === 'resolved').length}</p>
          </div>
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
            <h4 className="text-sm text-gray-600">Unresolved Complaints</h4>
            <p className="text-lg font-bold">{testComplaints.filter(complaint => complaint.status === 'unresolved').length}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Complaints</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by title or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by Status</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by Category</option>
            <option value="IT support">IT Support</option>
            <option value="facilities">Facilities</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>

      {/* Complaints Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-blue-100 p-6 rounded-lg shadow-lg">
        <div className="space-y-6">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-800">{complaint.title}</h4>
                <span
                  className={`px-2 py-1 rounded text-sm font-semibold ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {complaint.status === 'resolved' ? 'Resolved' : 'Unresolved'}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{complaint.description}</p>
              <div className="flex flex-wrap space-x-4 text-sm text-gray-500">
                <p><strong>Category:</strong> {complaint.category || 'Not specified'}</p>
                <p><strong>Submitted On:</strong> {complaint.submittedOn || 'Invalid Date'}</p>
                <p><strong>Submitted By:</strong> {testUsers[complaint.userId]?.email || 'Unknown'}</p>
                <p><strong>Priority:</strong> {complaint.priority || 'Not specified'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import '../index.css';
import { db } from '../firebase';
import { query, where } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { collection, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Trash2 } from 'lucide-react';
import AdminProfiePhoto from "../media/Admin_placeholder.jpg";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [admin, setAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePhoto: AdminProfiePhoto,
  });
  const [feedbacks, setFeedbacks] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error("No user is logged in.");
        return;
      }

      const loggedInEmail = user.email;

        const complaintsSnapshot = await getDocs(collection(db, "complaints"));
        const complaintsList = complaintsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComplaints(complaintsList);
        setFilteredComplaints(complaintsList);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = {};
        usersSnapshot.forEach((doc) => {
          usersList[doc.id] = doc.data();
        });
        setUsers(usersList);

        const adminQuery = query(collection(db, "users"), where("email", "==", loggedInEmail), where("role", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data(); 
          setAdmin({
            firstName: adminData.firstName || '',
            lastName: adminData.lastName || '',
            email: adminData.email || '',
            profilePhoto: adminData.profilePhoto || AdminProfiePhoto,
          });
        } else {
          console.error("No admin found in the database.");
        }

        const suggestionsSnapshot = await getDocs(collection(db, "suggestions"));
        const suggestionsList = suggestionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSuggestions(suggestionsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    let filtered = complaints;
  
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
  
  const handleToggleStatus = async (id, currentStatus) => {
    const complaintRef = doc(db, "complaints", id);
    await updateDoc(complaintRef, {
      status: currentStatus === "resolved" ? "unresolved" : "resolved",
    });

    toast.success(`Complaint status updated to ${currentStatus === "resolved" ? "Unresolved" : "Resolved"}`);

    const querySnapshot = await getDocs(collection(db, "complaints"));
    const complaintsList = [];
    querySnapshot.forEach((doc) => {
      complaintsList.push({ id: doc.id, ...doc.data() });
    });
    setComplaints(complaintsList);
    setFilteredComplaints(complaintsList);
  };

  
  const handleDeleteFeedback = async (id, feedbackToDelete) => {
    try {
      const complaintRef = doc(db, "complaints", id);
  
      await updateDoc(complaintRef, {
        feedbacks: arrayRemove(feedbackToDelete),
      });
  
      toast.success("Feedback deleted successfully!");
  
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                feedbacks: complaint.feedbacks
                  ? complaint.feedbacks.filter((fb) => fb.timestamp !== feedbackToDelete.timestamp)
                  : [],
              }
            : complaint
        )
      );
  
      setFilteredComplaints((prevFiltered) =>
        prevFiltered.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                feedbacks: complaint.feedbacks
                  ? complaint.feedbacks.filter((fb) => fb.timestamp !== feedbackToDelete.timestamp)
                  : [],
              }
            : complaint
        )
      );
    } catch (error) {
      toast.error("Error deleting feedback");
      console.error("Error deleting feedback:", error);
    }
  };
  

  const handleAddFeedback = async (id) => {
    if (!feedbacks[id]) {
      toast.error("Please provide feedback!");
      return;
    }
  
    try {
      const complaintRef = doc(db, "complaints", id);
      
      const complaintSnap = await getDocs(collection(db, "complaints"));
      let existingFeedbacks = [];
      
      complaintSnap.forEach((doc) => {
        if (doc.id === id) {
          existingFeedbacks = doc.data().feedbacks || [];
        }
      });
  
      const newFeedback = {
        message: feedbacks[id],
        timestamp: new Date().toISOString(),
        adminId: admin.email, 
      };
  
      await updateDoc(complaintRef, {
        feedbacks: [...existingFeedbacks, newFeedback],
      });
  
      toast.success("Feedback added successfully!");

      setFeedbacks((prevFeedbacks) => ({
        ...prevFeedbacks,
        [id]: "", 
      }));

      const querySnapshot = await getDocs(collection(db, "complaints"));
      const complaintsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(complaintsList);
      setFilteredComplaints(complaintsList);
    } catch (error) {
      toast.error("Error adding feedback");
      console.error("Error adding feedback:", error);
    }
  };
  

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((complaint) => complaint.status === "resolved").length;
  const unresolvedComplaints = complaints.filter((complaint) => complaint.status === "unresolved").length;

  const chartDataStatus = {
    labels: ['Resolved', 'Unresolved'],
    datasets: [
      {
        data: [resolvedComplaints, unresolvedComplaints],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const categoryData = complaints.reduce((acc, complaint) => {
    const category = complaint.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartDataCategory = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: ['#FFB830', '#FF6384', '#36A2EB', '#FFCE56', '#8A2BE2'],
        hoverBackgroundColor: ['#FFB830', '#FF6384', '#36A2EB', '#FFCE56', '#8A2BE2'],
      },
    ],
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbacks((prevFeedbacks) => ({
      ...prevFeedbacks,
      [id]: value,
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center mt-4 sm:mt-0">
            <img
              src={admin.profilePhoto}
              alt="Admin Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
            <div className="ml-4">
              <h2 className="font-semibold text-lg">{`${admin.firstName} ${admin.lastName}`}</h2>
              <p className="text-gray-500 text-sm">{admin.email}</p>
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
            <p className="text-lg font-bold">{totalComplaints}</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow">
            <h4 className="text-sm text-gray-600">Resolved Complaints</h4>
            <p className="text-lg font-bold">{resolvedComplaints}</p>
          </div>
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
            <h4 className="text-sm text-gray-600">Unresolved Complaints</h4>
            <p className="text-lg font-bold">{unresolvedComplaints}</p>
          </div>
        </div>
      </div>

      {/* Filters and Pie Chart Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Filter Section */}
        <div className="p-6 bg-blue-50 border-2 border-blue-500 rounded-lg shadow-lg">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Filters</h3>
  
  <input
    type="text"
    placeholder="Search Complaints"
    className="w-full p-2 border rounded mb-4"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  
  <select
    className="w-full p-2 border rounded mb-4"
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="">All Status</option>
    <option value="resolved">Resolved</option>
    <option value="unresolved">Unresolved</option>
  </select>
  
  <select
            className="w-full p-2 border rounded mb-4"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Filter by Category</option>
            <option value="IT support">IT Support</option>
            <option value="facilities">Facilities</option>
            <option value="academics">Academics</option>
            <option value="others">Others</option>
          </select>

  <select
    className="w-full p-2 border rounded mb-4"
    value={filterPriority}
    onChange={(e) => setFilterPriority(e.target.value)}
  >
    <option value="">All Priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
  
  <button
    onClick={handleSearch}
    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-8"
  >
    Search
  </button>
  <div className="flex justify-end">
  <button
    onClick={() => {
      setSearchQuery("");
      setFilterStatus("");
      setFilterCategory("");
      setFilterPriority("");
      setFilteredComplaints(complaints);
    }}
    className="bg-gray-500 text-white text-sm py-1 px-2 rounded hover:bg-gray-600 ml-auto"
  >
    Reset Filters
  </button>
  </div>
</div>


        {/* Pie Chart Section */}
        <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports & Analytics</h3>
          <div className="flex flex-wrap justify-between">
            <div className="w-full sm:w-1/2 p-4 bg-gray-50 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Complaint Status</h4>
              <Pie data={chartDataStatus} />
            </div>
            <div className="w-full sm:w-1/2 p-4 bg-gray-50 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Complaint Categories</h4>
              <Pie data={chartDataCategory} />
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-blue-100 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Complaints</h2>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Show Suggestions
          </button>
        </div>

        {/* Suggestions Modal */}
        {showSuggestions && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Suggestions</h3>
              <ul className="space-y-4 bg-blue-50 p-6 rounded-lg shadow-lg">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id} className="border-b pb-4">
                    <h4 className="font-bold text-gray-800">{suggestion.title}</h4>
                    <p className="text-gray-600">{suggestion.description}</p>
                    <p className="text-gray-500 text-sm">Submitted on: {suggestion.submittedOn}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowSuggestions(false)}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-md transition-transform transform hover:scale-102">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold">{complaint.title}</h4>
                <span
                  className={`px-2 py-1 rounded text-sm font-semibold ${
                    complaint.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {complaint.status === "resolved" ? "Resolved" : "Unresolved"}
                </span>
              </div>

              <p className="text-lg mb-4">{complaint.description}</p>

              {/* Display Category, Priority, and Submitted Date */}
              <div className="flex flex-wrap space-x-4 text-sm text-gray-600 mb-4">
                <p><strong>Category:</strong> {complaint.category || 'Not specified'}</p>
                <p><strong>Submitted On:</strong> {complaint.submittedOn || 'Invalid Date'}</p>
                <p><strong>Submitted By:</strong> {users[complaint.userId] ? users[complaint.userId].email : 'Unknown'}</p>

                <p>
                  <strong>Priority: </strong>
                  <span
                    className={`inline-block px-2 py-1 rounded text-white font-semibold ${
                      complaint.priority === 'High'
                        ? 'bg-red-500'
                        : complaint.priority === 'Medium'
                        ? 'bg-yellow-500'
                        : complaint.priority === 'Low'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    {complaint.priority || 'Not specified'}
                  </span>
                </p>
              </div>

        {/* Feedback Section with Delete Option */}
        {complaint.feedbacks && complaint.feedbacks.length > 0 && (
          <div className="mt-4 mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow">
            <h5 className="font-semibold text-gray-700">Feedbacks: </h5>
            <ul className="mt-2">
              {complaint.feedbacks.map((feedback, index) => (
                <li 
                  key={index} 
                  className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-2"
                >
                  <div>
                    <span className="font-semibold text-gray-800">{feedback.adminId}:</span> 
                    <span className="text-gray-600 ml-2">{feedback.message}</span> 
                    <span className="text-gray-500 text-sm ml-2">
                      ({new Date(feedback.timestamp).toLocaleString()})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteFeedback(complaint.id, feedback)}
                    className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                    title="Delete feedback"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}


              {/* Add Feedback Input */}
              <textarea
                placeholder="Add Feedback"
                className="w-full p-2 border rounded mb-4"
                value={feedbacks[complaint.id] || ''}
                onChange={(e) => handleFeedbackChange(complaint.id, e.target.value)}
              />

              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <button
                  onClick={() => handleAddFeedback(complaint.id)}
                  className="bg-dark-blue-600 text-white py-2 px-4 rounded mb-4 sm:mb-0 hover:bg-dark-blue"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => handleToggleStatus(complaint.id, complaint.status)}
                  className={`py-2 px-4 rounded mb-4 font-semibold sm:mb-0 text-white ${
                    complaint.status === "resolved"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {complaint.status === "resolved" ? "Mark as Unresolved" : "Mark as Resolved"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
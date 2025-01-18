import React, { useState, useEffect } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import ProfilePhoto from "../media/StudentDashboard_Placeholder.png";

const StudentDashboard = ({ isSidebarCollapsed }) => {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    contactNo: '',
    profilePhoto: ProfilePhoto,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const userId = auth?.currentUser?.uid;
  const navigate = useNavigate();

  // Fetch user details
  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        setUser({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          department: userData.department || '',
          contactNo: userData.contactNumber || '',
          profilePhoto: userData.profilePhoto || ProfilePhoto,
          userType: userData.userType || '',
        });
      });
    };

    fetchUserDetails();
  }, [userId]);

  // Fetch complaints and listen for updates
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(collection(db, 'complaints'), (querySnapshot) => {
      const complaintsArray = [];
      querySnapshot.forEach((doc) => {
        const complaintData = doc.data();
        if (complaintData.userId === userId) {
          complaintsArray.push({ id: doc.id, ...complaintData });
        }
      });
      setComplaints(complaintsArray);
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, [userId]);

  const handleFeedbackClick = (complaintId) => {
    setSelectedComplaint((prev) => (prev === complaintId ? null : complaintId));
  };

  // Calculate statistics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((complaint) => complaint.status === 'resolved').length;
  const unresolvedComplaints = totalComplaints - resolvedComplaints;

  return (
    <div className={`flex-1 p-6 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="shadow-lg rounded-lg p-6 flex flex-col items-center space-y-4 bg-white bg-opacity-90">
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 hover:scale-105 transition-transform"
          />
          <h2 className="text-3xl font-semibold text-gray-800">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Department: {user.department}</p>
          <p className="text-gray-600">User Type: {user.userType}</p>
          <p className="text-gray-600">Contact No: {user.contactNo}</p>

          {/* Statistics Section */}
          <div className="mt-6 w-full p-4 border-2 border-grey-100 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Complaint Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-6">
              {/* Total Complaints */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow mb-4">
                <h4 className="text-sm text-gray-600">Total Complaints</h4> 
                <p className="text-lg font-bold">{totalComplaints}</p>
              </div>
            </div>

            {/* Resolved and Unresolved Complaints */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resolved Complaints */}
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow">
                <h4 className="text-sm text-gray-600">Resolved<br></br> Complaints</h4>
                <p className="text-lg font-bold">{resolvedComplaints}</p>
              </div>

              {/* Unresolved Complaints */}
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
                <h4 className="text-sm text-gray-600">Unresolved Complaints</h4>
                <p className="text-lg font-bold">{unresolvedComplaints}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="md:col-span-2">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Complaints</h3>
          {complaints.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>No complaints yet.</p>
              <p className="mt-2">Feel free to add your first complaint!</p>
            </div>
          ) : (
            complaints.map((complaint, index) => (
              <div
                key={complaint.id}
                className={`bg-white shadow-lg rounded-lg p-4 mb-4 transition-all duration-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-bold text-gray-800">{complaint.title}</h4>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-sm font-semibold ${
                      complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                    style={{
                      minWidth: '80px',
                      height: '30px',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {complaint.status === 'resolved' ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{complaint.description}</p>
                <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600 mb-4">
                  <p><strong>Category:</strong> {complaint.category}</p>
                  <p><strong>Submitted On:</strong> {complaint.submittedOn}</p>
                  <p><strong>Priority:</strong> {complaint.priority}</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleFeedbackClick(complaint.id)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
                  >
                    {selectedComplaint === complaint.id ? 'Hide Feedback' : 'Show Feedback'}
                  </button>
                </div>
                {selectedComplaint === complaint.id && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <p>
                      <strong>Feedback from Admin:</strong> 
                      {complaint.feedback || 'No feedback provided yet'}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/makecomplaint')}
              className="bg-dark-blue text-white px-6 py-3 rounded-lg shadow-lg hover:bg-dark-blue-600 transition-colors"
            >
              Add a Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

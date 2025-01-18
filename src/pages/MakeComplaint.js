import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Modal from "../Modal";
import { useNavigate } from "react-router-dom";

const MakeComplaint = () => {
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : null;
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Low",
    agreement: false,
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const closeModal = () => setShowModal(false);

  
  const validateFields = () => {
    if (!formData.title || formData.title.trim() === "") {
      setModalMessage("Please enter a valid title.");
      setShowModal(true);
      return false;
    }

    if (!formData.description || formData.description.trim() === "") {
      setModalMessage("Please provide a description for the complaint.");
      setShowModal(true);
      return false;
    }

    if (!formData.category || formData.category === "") {
      setModalMessage("Please select a category.");
      setShowModal(true);
      return false;
    }

    if (!formData.priority || formData.priority === "") {
      setModalMessage("Please select a priority level.");
      setShowModal(true);
      return false;
    }

    if (!formData.agreement) {
      setModalMessage("You must agree to the privacy policy.");
      setShowModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setModalMessage("You must be logged in to submit a complaint.");
      setShowModal(true);
      return;
    }

    if (!validateFields()) {
      return; 
    }

    setLoading(true);

    const complaint = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: "Unresolved",
      submittedOn: new Date().toLocaleDateString(),
      userId: userId,
    };

    try {
      await addDoc(collection(db, "complaints"), complaint);
      setModalMessage("Complaint submitted successfully!");
      setShowModal(true);

      
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "Low",
        agreement: false,
      });

      
      setTimeout(() => {
        setShowModal(false);
        navigate("/studentdashboard"); 
      }, 2000);
    } catch (error) {
      setModalMessage("Error submitting complaint. Please try again.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-r from-yellow-50 to-purple-100 p-8 min-h-screen overflow-hidden">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Register a Complaint</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl mx-auto space-y-6"
      >
        
        <fieldset className="space-y-4">
          <legend className="font-semibold text-xl text-gray-700 mb-4">Complaint Details</legend>
          <label className="block text-gray-700">
            Complaint Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block text-gray-700">
            Description of Complaint:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block text-gray-700">
            Category:
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Category</option>
              <option value="IT Support">IT Support</option>
              <option value="Facilities">Facilities</option>
              <option value="Academics">Academics</option>
              <option value="Others">Others</option>
            </select>
          </label>
          <label className="block text-gray-700">
            Priority:
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </fieldset>

        
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            name="agreement"
            checked={formData.agreement}
            onChange={handleChange}
            className="h-5 w-5"
          />
          <span className="text-sm">I agree to the privacy policy.</span>
        </label>

        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-dark-blue-600 text-white rounded-lg hover:bg-dark-blue-600 focus:outline-none focus:ring-2 focus:ring-dark-blue-600"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      
      {showModal && <Modal message={modalMessage} onClose={closeModal} />}
    </main>
  );
};

export default MakeComplaint;

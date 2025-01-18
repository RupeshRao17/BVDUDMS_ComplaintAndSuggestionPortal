import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; 
import Modal from "../Modal"; 

const MakeSuggestion = () => {
  const { currentUser } = useAuth(); 
  const userId = currentUser ? currentUser.uid : null; 

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setModalMessage("You must be logged in to submit a suggestion.");
      setShowModal(true);
      return;
    }

    if (!formData.agreement) {
      setModalMessage("You must agree to the privacy policy.");
      setShowModal(true);
      return;
    }

    setLoading(true);

    const suggestion = {
      title: formData.title,
      description: formData.description,
      status: "Unresolved",
      submittedOn: new Date().toLocaleDateString(),
      userId: userId,
    };

    try {
      await addDoc(collection(db, "suggestions"), suggestion);
      setModalMessage("Suggestion submitted successfully!");
      setShowModal(true);
      setFormData({
        title: "",
        description: "",
        agreement: false,
      });
    } catch (error) {
      setModalMessage("Error submitting suggestion. Please try again.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-yellow-50 to-blue-100 p-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Make a Suggestion</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl mx-auto space-y-6"
      >
        {/* Suggestion Details */}
        <fieldset className="space-y-4">
          <legend className="font-semibold text-xl text-gray-700 mb-4">Suggestion Details</legend>
          <label className="block text-gray-700">
            Suggestion Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>
          <label className="block text-gray-700">
            Description of Suggestion:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-2 block w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>
        </fieldset>

        {/* Agreement */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-dark-blue text-white rounded-lg hover:bg-dark-blue-600 focus:outline-none focus:ring-2 focus:dark-blue-600"
        >
          {loading ? "Submitting..." : "Submit Suggestion"}
        </button>
      </form>

      {/* Modal for Error/Success Messages */}
      {showModal && <Modal message={modalMessage} onClose={closeModal} />}
    </main>
  );
};

export default MakeSuggestion;

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import campusImageDesktop from "../media/Campus_image_2.jpg";
import Modal from "../Modal"; // Ensure the path is correct

const SignUp = () => {
  const [formData, setFormData] = useState({
    contactNumber: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    department: "Select department",
    userType: "Select UserType",
    role: "user",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async () => {
    const validateField = (value, message) => {
      if (!value || value === "Select department" || value === "Select UserType") {
        setErrorMessage(message);
        setShowModal(true);
        return false;
      }
      return true;
    };
  
    const validateContactNumber = (contactNumber) => {
      if (contactNumber.length !== 10 || isNaN(contactNumber)) {
        setErrorMessage("Please enter a valid 10-digit contact number.");
        setShowModal(true);
        return false;
      }
      return true;
    };
  
    const validateEmail = (email) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        setErrorMessage("Please enter a valid email address.");
        setShowModal(true);
        return false;
      }
      return true;
    };
  
    if (
      !validateField(formData.firstName, "Please enter your first name.") ||
      !validateField(formData.lastName, "Please enter your last name.") ||
      !validateField(formData.contactNumber, "Please enter your contact number.") ||
      !validateField(formData.email, "Please enter your email.") ||
      !validateField(formData.password, "Please enter your password.") ||
      !validateField(formData.department, "Please select a department.") ||
      !validateField(formData.userType, "Please select a user type.") ||
      !validateContactNumber(formData.contactNumber) ||
      !validateEmail(formData.email)
    ) {
      return;
    }
  
    try {
      const { email, password, ...userData } = formData;
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...userData,
        email: email,
        userId: userCredential.user.uid,
        userType: formData.userType.toLowerCase(),
      });
  
      // Update errorMessage to show a success message
      setErrorMessage("SignUp Successful! Please log in.");
      setShowModal(true); // Show the modal on success
  
      // Optionally, navigate after closing the modal (handle this as per your needs)
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Navigate after 2 seconds (or adjust as necessary)
    } catch (error) {
      console.error("Error signing up:", error);
      setErrorMessage(error.message);
      setShowModal(true); // Show the modal in case of error
    }
  };

  return (
    <div
      className="relative flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${campusImageDesktop})`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none z-0"></div>

      <div className="relative z-10 bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-dark-blue mb-2">
          Sign Up
        </h2>
        <hr className="mb-5" />
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="Enter your first name"
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Enter your last name"
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              placeholder="Enter your contact number"
              maxLength="10"
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            />
            <small className="text-gray-600 mt-1 block">
              Password should have Minimum of 8 characters and must contain at least:
              <ul className="list-disc ml-5">
                <li>One uppercase letter ex. A,B</li>
                <li>One lowercase letter ex. a,b</li>
                <li>One special character ex. #,@</li>
                <li>One digit ex. 1,2</li>
              </ul>
            </small>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Department
            </label>
            <select
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              value={formData.department}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            >
              <option value="">Select department</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              User Type
            </label>
            <select
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              value={formData.userType}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-blue"
            >
              <option value="">Select UserType</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Other</option>
            </select>
          </div>

          <button
            onClick={handleSignUp}
            className="w-full bg-dark-blue text-white py-2 rounded-md font-semibold hover:bg-blue-800 transition duration-300"
          >
            Sign Up
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-dark-blue font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>

      {showModal && <Modal message={errorMessage} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default SignUp;
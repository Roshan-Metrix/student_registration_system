import React, { useState, useEffect, useContext } from "react";
import NavInsideBar from "../components/NavInsideBar";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Reusable Input component
const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  step,
  min,
  max,
  placeholder,
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
    )}
    <input
      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
    />
  </div>
);

// Reusable Select component
const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <select
      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ContentDatas = () => {
  const { backendUrl } = useContext(AppContent);
  const [step, setStep] = useState(1);
  const [studentUID, setStudentUID] = useState(null);
  const [formData, setFormData] = useState({});
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const sectionTitles = [
    "Batch Details",
    "Student Information",
    "Fee's Details",
    "Attendance Percentage",
    "Semester Table",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch user info
        const { data: userRes } = await axios.get(
          `${backendUrl}/api/roles/user/data`,
          {
            withCredentials: true,
          }
        );

        if (!userRes.success) return toast.error(userRes.message);

        const { role, dept } = userRes.userData;

        //  If admin -> fetch all distinct courses
        if (role === "admin") {
          const { data: courseRes } = await axios.get(
            `${backendUrl}/api/roles/get-courses-years`,
            {
              withCredentials: true,
            }
          );

          if (courseRes.success) {
            setCourses(courseRes.courses || []);
            setYears(courseRes.years || []);
          } else {
            toast.error(courseRes.message);
          }
        }

        // If staffs -> use their own department
        else if (role === "staffs") {
          const { data: courseRes } = await axios.get(
            `${backendUrl}/api/roles/get-courses-years`,
            {
              withCredentials: true,
            }
          );
          if (courseRes.success) {
            setCourses([dept]);
            setYears(courseRes.years || []);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchUser();
  }, [backendUrl]);

  // Input handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let finalValue = value;
    if (name === "name") {
      finalValue = value
        .split(" ")
        .map((word) => word.toUpperCase())
        .join(" ");
    }
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : finalValue,
    }));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 16 && age <= 100;
  };

  const validateRequiredFields = () => {
    const requiredFields = {
      name: "Name",
      dob: "Date of Birth",
      fatherName: "Father's Name",
      contactNo: "Contact Number",
      email: "Email",
      address: "Address",
      gender: "Gender"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        toast.error(`${label} is required`);
        return false;
      }
    }

    // Validate email format
    if (formData.email && !validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate age
    if (formData.dob && !validateAge(formData.dob)) {
      toast.error("Age must be between 16 and 100 years");
      return false;
    }

    // Validate contact number (10 digits)
    if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      toast.error("Contact number must be 10 digits");
      return false;
    }

    return true;
  };

  // Step navigation
  const handleNext = async () => {
    if (step === 1 && (!formData.course || !formData.year)) {
      toast.error("Course and Year are compulsory!");
      return;
    }
    // Step 2 submission
    if (step === 2) {
      // Validate required fields before submission
      if (!validateRequiredFields()) {
        return;
      }

      try {
        const studentForm = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          studentForm.append(key, value);
        });
        const { data } = await axios.post(
          `${backendUrl}/api/roles/students`,
          studentForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        if (data.success) {
          toast.success("Student data saved successfully!");
          setStudentUID(data.student_uid);
          setStep(3);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // Step 5 final submit for all other data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentUID) {
      toast.error("Student UID missing! Complete step 2 first.");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/roles/students/moreData/${studentUID}`,
        formData,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("All data saved successfully!");
        setFormData({});
        setStep(1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      <NavInsideBar />
      <div className="flex flex-col items-center pt-6 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">
          {sectionTitles[step - 1]}
        </h2>
        <p className="text-slate-500 mb-6 text-center">Step {step} of 5</p>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-3xl mb-10"
        >
          {/* STEP 1 - Batch Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-6">
              <Select
                label="Course"
                name="course"
                value={formData.course || ""}
                onChange={handleChange}
                options={courses}
                required
              />
              <Select
                label="Year"
                name="year"
                options={years}
                value={formData.year || ""}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* STEP 2 - Student Information */}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Name *"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Date of Birth *"
                name="dob"
                type="date"
                value={formData.dob || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Father's Name *"
                name="fatherName"
                value={formData.fatherName || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Father's Occupation *"
                name="fatherOccupation"
                value={formData.fatherOccupation || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Mother's Name *"
                name="motherName"
                value={formData.motherName || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Mother's Occupation"
                name="motherOccupation"
                value={formData.motherOccupation || ""}
                onChange={handleChange}
              />
              <Input
                label="Medium of Instruction *"
                name="mediumOfInstruction"
                value={formData.mediumOfInstruction || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Marks Scored *"
                name="marksScored"
                type="number"
                required
                value={formData.marksScored || ""}
                onChange={handleChange}
              />
              <Input
                label="Percentage *"
                name="percentage"
                type="number"
                step="0.01"
                value={formData.percentage || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="School Name & Place *"
                name="schoolNamePlace"
                value={formData.schoolNamePlace || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Religion"
                name="religion"
                value={formData.religion || ""}
                onChange={handleChange}
              />
              <Input
                label="Nationality *"
                name="nationality"
                value={formData.nationality || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Date of Admission *"
                name="dateOfAdmission"
                type="date"
                value={formData.dateOfAdmission || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Date of Leaving"
                name="dateOfLeaving"
                type="date"
                value={formData.dateOfLeaving || ""}
                onChange={handleChange}
              />
              <Input
                label="Aadhaar"
                name="aadhaar"
                value={formData.aadhaar || ""}
                onChange={handleChange}
              />
              <Input
                label="Contact No *"
                name="contactNo"
                value={formData.contactNo || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
              <Input
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
              <Select
                label="Gender *"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                options={["Male", "Female"]}
                required
              />
              <Select
                label="Category *"
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                options={["FC", "BC", "OBC", "MBC", "BCM", "EBC", "SC"]}
                required
              />
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup || ""}
                onChange={handleChange}
                options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
              />
              <Input
                label="Scholarship Details"
                name="scholarshipDetails"
                value={formData.scholarshipDetails || ""}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload Photo
                </label>
                {/*   <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                /> */}
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setFormData((prev) => ({ ...prev, photo: file }));
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 3 - Fees Details */}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-6">
              <table className="w-full border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-200">
                  <tr>
                    <th
                      colSpan={4}
                      className="text-left px-4 py-2 font-semibold"
                    >
                      Academic Year Fees
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border-r">I</th>
                    <th className="px-4 py-2 border-r">II</th>
                    <th className="px-4 py-2 border-r">III</th>
                    <th className="px-4 py-2">IV</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[1, 2, 3, 4].map((yr) => (
                      <td key={yr} className="px-4 py-2 border-r">
                        <Input
                          name={`feesYear${yr}`}
                          type="number"
                          value={formData[`feesYear${yr}`] || ""}
                          onChange={handleChange}
                          placeholder="Enter fees"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* STEP 4 - Attendance */}
          {step === 4 && (
            <div className="grid grid-cols-1 gap-6">
              <table className="w-full border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-200">
                  <tr>
                    <th
                      colSpan={8}
                      className="text-left px-4 py-2 font-semibold"
                    >
                      Attendance Percentage (Semester-wise)
                    </th>
                  </tr>
                  <tr>
                    {[...Array(8)].map((_, i) => (
                      <th key={i} className="px-4 py-2 border-r">
                        {`Sem ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[...Array(8)].map((_, i) => (
                      <td key={i} className="px-4 py-2 border-r">
                        <Input
                          name={`attendanceSem${i + 1}`}
                          type="number"
                          value={formData[`attendanceSem${i + 1}`] || ""}
                          onChange={handleChange}
                          min={0}
                          max={100}
                          placeholder="%"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* STEP 5 - Semester Table */}
          {step === 5 && (
            <div className="grid grid-cols-1 gap-6">
              <table className="w-full border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="px-4 py-2 border-r">Description</th>
                    {[...Array(8)].map((_, i) => (
                      <th key={i} className="px-4 py-2 border-r">
                        {`Sem ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["Exam Fees", "GPA", "CGPA", "MarkSheet"].map((desc) => (
                    <tr key={desc}>
                      <td className="px-4 py-2 border-r font-semibold">
                        {desc}
                      </td>
                      {[...Array(8)].map((_, semIdx) => (
                        <td key={semIdx} className="px-4 py-2 border-r">
                          <Input
                            name={`${desc.replace(/\s/g, "").toLowerCase()}Sem${
                              semIdx + 1
                            }`}
                            type={desc === "Exam Fees" ? "number" : "text"}
                            value={
                              formData[
                                `${desc.replace(/\s/g, "").toLowerCase()}Sem${
                                  semIdx + 1
                                }`
                              ] || ""
                            }
                            onChange={handleChange}
                            placeholder={desc === "Exam Fees" ? "Fees" : desc}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-gray-300 text-slate-800 rounded-lg font-semibold hover:bg-gray-400"
              >
                Back
              </button>
            )}
            {step < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
              >
                Next
              </button>
            )}
            {step === 5 && (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-600 cursor-pointer"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentDatas;

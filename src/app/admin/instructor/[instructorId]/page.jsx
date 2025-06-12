// /app/admin/instructor/[instructorId]/page.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

// --- Data Simulation & Options ---
const initialInstructorData = [
    { id: 1, name: 'Phay SOM', firstName: 'Phay', lastName: 'SOM', email: 'physom@gmail.com', phone: '012886667', major: 'Research Methodology', degree: 'PhD', department:'Faculty of IT', status: 'active', profileImage: 'https://media.licdn.com/dms/image/v2/C5603AQFztJoAXb0vTQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1616584101352?e=2147483647&v=beta&t=LTffaDKSkt4qCR2VgtDbeRkKF8Trhm_pqe-T7tlvbXk', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sam Vicheka', firstName: 'Sam', lastName: 'Vicheka', email: 'samvicheka@gmail.com', phone: '093956789', major: 'Network', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_UOl581yD7ebvnmXxGNIZiqRT4NTHD33igA&s', address : '123 Main St, Phnom Penh, Cambodia', password: 'password456' },
    { id: 3, name: 'Sreng Vichet', firstName: 'Sreng', lastName: 'Vichet', email: 'srengvichet@gmail.com', phone: '012345680', major: 'Information Technology', degree: 'Professor', department:'Faculty of IT', status: 'active', profileImage: 'data:image/jpeg;base64,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', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 4, name: 'Kang Sovannara', firstName: 'Kang', lastName: 'Sovvanara', email: 'kangsovvanara@gmail.com', phone: '012345681', major: 'Management of Change / Business / Investment Management', degree: 'PhD',department:'Faculty of Management', status: 'archived', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrKang-Sovannara-e1693628853981.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 5, name: 'Sok Seang', firstName: 'Sok', lastName: 'Seang', email: 'sokseang@gamil.com', phone: '012345682',  major: 'Entrepreneurship', degree: 'PhD', department:'Faculty of Business', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrSok-Seang-e1693629096526.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 6, name: 'Phim Runsinarith', firstName: 'Phim', lastName: 'Runsinarith', email: 'phimrunsinarith@gamil.com', phone: '012345683', major: 'Research / Economics', degree: 'PhD',department:'Faculty of Business', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrPhim-Runsinarith-1-e1693629343364.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' }, // No image
    { id: 7, name: 'Ly Sok Heng', firstName: 'Ly', lastName: 'Sok Heng', email: 'sokheng@gmail.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Ly-Sok-Heng-e1693626068844.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 8, name: 'Heng Dyna', firstName: 'Heng', lastName: 'Dyna', email: 'hengdyna@gamil.com.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Heng-Dyna.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    
];

const majorOptions = ['Computer Science', 'Information Technology', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics', 'Robotics'];
const degreeOptions = ['Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'];
const departmentOptions = ['Faculty of CS', 'Faculty of IT', 'Faculty of IS', 'Faculty of SE', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of Robotics'];


// --- Icon Components ---
const DefaultAvatarIcon = ({ className = "w-24 h-24" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const EyeOpenIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeClosedIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

// --- Skeleton Loader for Instructor Detail Page ---
const InstructorDetailSkeleton = () => {

  // A reusable component for a single form field (label + input)
  // This is very useful for form-heavy pages like this one.
  const SkeletonFormField = () => (
    <div className="flex-1 min-w-[200px] space-y-2">
      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
    </div>
  );

  return (
    <div className='p-6 animate-pulse'>
      {/* Page Header Skeleton */}
      <div className="h-7 w-40 bg-slate-300 dark:bg-slate-600 rounded"></div>
      <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

      <div className="profile-section flex gap-8 flex-wrap">
        {/* Left Column: Avatar Card Skeleton */}
        <div className="avatar-card w-[220px] h-[130px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
            <div className="flex">
                <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-600 mr-3"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                </div>
            </div>
            <div className="h-9 mt-3 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
        </div>

        {/* Right Column: Info Cards Skeleton */}
        <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
          {/* General Info Card Skeleton */}
          <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
            <div className="h-6 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-5"></div>
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
              <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
            </div>
            <div className="flex justify-end items-center gap-3 mt-6">
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              <div className="h-8 w-28 bg-slate-400 dark:bg-slate-500 rounded-md"></div>
            </div>
          </div>
          
          {/* Password Card Skeleton */}
           <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
             <div className="h-6 w-52 bg-slate-300 dark:bg-slate-600 rounded mb-5"></div>
             <div className="space-y-4">
                <div className="flex gap-3 flex-wrap"><SkeletonFormField /><SkeletonFormField /></div>
                <div className="flex gap-3 flex-wrap"><SkeletonFormField /></div>
             </div>
             <div className="flex justify-end items-center gap-3 mt-6">
                <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                <div className="h-8 w-36 bg-slate-400 dark:bg-slate-500 rounded-md"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InstructorDetailsContent = () => {
    // --- State Variables ---
    const router = useRouter();
    const params = useParams();
    const [instructorDetails, setInstructorDetails] = useState(null);
    const [editableInstructorDetails, setEditableInstructorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [emptyPasswordError, setEmptyPasswordError] = useState({
        new: false,
        confirm: false
    });
    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const fetchInstructorDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = initialInstructorData.find(inst => inst.id === id);
            if (data) {
                setInstructorDetails(data);
                setEditableInstructorDetails({ ...data });
                setImagePreviewUrl(data.profileImage || null);
            } else {
                setError('Instructor not found.');
            }
        } catch (err) {
            setError("Failed to load instructor details.");
        } finally {
            setLoading(false);
        }
    };

    const saveGeneralInfo = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            const updatedDetails = { ...editableInstructorDetails, profileImage: imagePreviewUrl };
            setInstructorDetails(updatedDetails);
            setEditableInstructorDetails({ ...updatedDetails });
            setIsEditingGeneral(false);
            setSuccessMessage("General information updated successfully!");
        } catch (err) {
            setError(`Error saving general info: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const savePassword = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPasswordMismatchError(false);
        setEmptyPasswordError({ new: false, confirm: false });

        const isNewPasswordEmpty = !newPassword;
        const isConfirmPasswordEmpty = !confirmNewPassword;

        if (isNewPasswordEmpty || isConfirmPasswordEmpty) {
            setError("New and confirm password fields are required.");
            setEmptyPasswordError({
                new: isNewPasswordEmpty,
                confirm: isConfirmPasswordEmpty,
            });
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            setPasswordMismatchError(true);
            setLoading(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            const updatedDetails = { ...instructorDetails, password: newPassword };
            setInstructorDetails(updatedDetails);
            setEditableInstructorDetails({ ...updatedDetails });

            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setSuccessMessage("Password updated successfully!");
        } catch (err) {
            setError(`Error changing password: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Hooks ---
    useEffect(() => {
        const instructorIdFromUrl = params.instructorId;
        if (instructorIdFromUrl) {
            fetchInstructorDetails(parseInt(instructorIdFromUrl, 10));
        }
    }, [params.instructorId]);

    useEffect(() => {
        if (!isEditingGeneral || !editableInstructorDetails) return;
        setEditableInstructorDetails(prev => ({
            ...prev,
            name: `${prev.firstName || ''} ${prev.lastName || ''}`.trim()
        }));
    }, [editableInstructorDetails?.firstName, editableInstructorDetails?.lastName, isEditingGeneral]);

    // --- Handlers ---
    const handleEditClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableInstructorDetails({ ...instructorDetails });
            setImagePreviewUrl(instructorDetails.profileImage);
            setIsEditingGeneral(true);
        } else if (section === 'password') {
            setIsEditingPassword(true);
        }
    };

    const handleCancelClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableInstructorDetails({ ...instructorDetails });
            setImagePreviewUrl(instructorDetails.profileImage);
            setIsEditingGeneral(false);
        } else if (section === 'password') {
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ new: false, confirm: false });
        }
    };

    const handleSaveClick = (section) => {
        if (section === 'general') {
            saveGeneralInfo();
        } else if (section === 'password') {
            savePassword();
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
                if (!isEditingGeneral) {
                    setIsEditingGeneral(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableInstructorDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        if (emptyPasswordError.new) {
            setEmptyPasswordError(prev => ({ ...prev, new: false }));
            setError(null);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
        if (passwordMismatchError) {
            setPasswordMismatchError(false);
            setError(null);
        }
        if (emptyPasswordError.confirm) {
            setEmptyPasswordError(prev => ({ ...prev, confirm: false }));
            setError(null);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // --- Render Logic ---
    if (loading && !instructorDetails) {
        return <InstructorDetailSkeleton />;
    }

    if (!instructorDetails) return <div className="p-6 text-red-500">Instructor not found.</div>;;

    const currentData = isEditingGeneral ? editableInstructorDetails : instructorDetails;

    // --- Render Functions ---
    const renderTextField = (label, name, value, isEditing, opts = {}) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <input
                type={opts.type || "text"}
                name={name}
                value={value || ''}
                placeholder={opts.placeholder || label}
                onChange={handleInputChange}
                readOnly={!isEditing}
                disabled={loading}
                className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
            />
        </div>
    );
    
    const renderSelectField = (label, name, value, options, isEditing) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white">
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );
    
    const renderPasswordField = (label, name, value, onChange, fieldName, hasError = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 ${
                        hasError || emptyPasswordError[fieldName]
                        ? 'border-red-500 ring-1 ring-red-500' 
                        : 'border-num-gray-light dark:border-gray-600'
                    }`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={onChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                />
                {isEditingPassword && (
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility(fieldName)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        aria-label={passwordVisibility[fieldName] ? "Hide password" : "Show password"}
                    >
                        {passwordVisibility[fieldName] ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Instructor Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
                    <div className="avatar-content flex relative">
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Profile Preview" width={56} height={56} className="avatar-img w-14 h-14 rounded-full mr-3 object-cover" />
                        ) : (
                            <DefaultAvatarIcon className="avatar-img w-14 h-14 rounded-full mr-3" />
                        )}
                        <span className={`avatar-img absolute left-[42px] bottom-[20px] block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${instructorDetails.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={`Status: ${instructorDetails.status}`}></span>
                        <div className='avatar-info flex flex-col'>
                            <div className='avatar-name font-semibold text-lg text-black dark:text-white mb-0.5'>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleUploadButtonClick}
                                disabled={isUploading}
                                className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
                        </div>
                    </div>
                </div>

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("First Name", "firstName", currentData.firstName, isEditingGeneral)}
                            {renderTextField("Last Name", "lastName", currentData.lastName, isEditingGeneral)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Email", "email", currentData.email, isEditingGeneral, { type: 'email' })}
                            {renderTextField("Phone Number", "phone", currentData.phone, isEditingGeneral, { type: 'tel' })}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Major", "major", currentData.major, majorOptions, isEditingGeneral)}
                            {renderSelectField("Degree", "degree", currentData.degree, degreeOptions, isEditingGeneral)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Department", "department", currentData.department, departmentOptions, isEditingGeneral)}
                            {renderTextField("Address", "address", currentData.address, isEditingGeneral)}
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingGeneral ? (
                                <>
                                    <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => handleSaveClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                        Back
                                    </button>
                                    <button onClick={() => handleEditClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Edit Profile</button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">Password information</div>
                        
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.current ? "text" : "password"}
                                        readOnly
                                        value={instructorDetails.password}
                                        className="form-input w-full py-2 px-3  bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={passwordVisibility.current ? "Hide password" : "Show password"}
                                    >
                                        {passwordVisibility.current ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                    </button>
                                </div>
                            </div>
                            {renderPasswordField("New Password", "newPassword", newPassword, handleNewPasswordChange, "new")}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderPasswordField(
                                "Confirm New Password", 
                                "confirmNewPassword", 
                                confirmNewPassword, 
                                handleConfirmPasswordChange, 
                                "confirm", 
                                passwordMismatchError
                            )}
                        </div>
                        
                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingPassword ? (
                                <>
                                    <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => handleSaveClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                        Back
                                    </button>
                                    <button onClick={() => handleEditClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Change Password</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InstructorDetailsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <InstructorDetailsContent />
        </AdminLayout>
    );
}
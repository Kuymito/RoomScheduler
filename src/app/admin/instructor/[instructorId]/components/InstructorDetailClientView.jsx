// 'use client';

// import { useRouter } from 'next/navigation';
// import { useEffect, useRef, useState } from 'react';
// import Image from 'next/image';
// import { useSWRConfig } from 'swr';
// import toast from 'react-hot-toast';

// import { instructorService } from '@/services/instructor.service';
// import { Spinner, EditIcon, ArchiveIcon, DefaultAvatarIcon } from './IconComponents';

// // --- Icon Components ---
// const EyeOpenIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> );
// const EyeClosedIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> );

// export default function InstructorDetailClientView({ initialInstructor, allDepartments, token }) {
//     const router = useRouter();
//     const { mutate } = useSWRConfig(); 

//     const [instructorDetails, setInstructorDetails] = useState(initialInstructor);
//     const [editableInstructorDetails, setEditableInstructorDetails] = useState({ ...initialInstructor });
//     const [loading, setLoading] = useState(false);
    
//     const [imagePreviewUrl, setImagePreviewUrl] = useState(initialInstructor.profileImage || null);
//     const fileInputRef = useRef(null);

//     const [isEditingGeneral, setIsEditingGeneral] = useState(false);
//     const [isEditingPassword, setIsEditingPassword] = useState(false);
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmNewPassword, setConfirmNewPassword] = useState('');
//     const [passwordMismatchError, setPasswordMismatchError] = useState(false);
//     const [passwordVisibility, setPasswordVisibility] = useState({ new: false, confirm: false });

//     const saveGeneralInfo = async () => {
//         if (!token) {
//             toast.error("Authentication session has expired.");
//             return;
//         }
//         setLoading(true);
//         const selectedDepartment = allDepartments.find(dept => dept.name === editableInstructorDetails.department);
//         const payload = {
//             firstName: editableInstructorDetails.firstName,
//             lastName: editableInstructorDetails.lastName,
//             phone: editableInstructorDetails.phone,
//             degree: editableInstructorDetails.degree,
//             major: editableInstructorDetails.major,
//             address: editableInstructorDetails.address,
//             profile: imagePreviewUrl,
//             departmentId: selectedDepartment ? selectedDepartment.departmentId : null
//         };
//         try {
//             await instructorService.patchInstructor(instructorDetails.id, payload, token);
//             const updatedDetails = { ...instructorDetails, ...editableInstructorDetails, profileImage: imagePreviewUrl };
//             setInstructorDetails(updatedDetails);
//             setIsEditingGeneral(false);
//             mutate(['/api/v1/instructors', token]); 
//             toast.success("Instructor details updated successfully!");
//         } catch (err) {
//             toast.error(`Update failed: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     const savePassword = async () => {
//         setLoading(true);
//         setPasswordMismatchError(false);
//         if (!newPassword || !confirmNewPassword) {
//             toast.error('Please fill out both new password fields.');
//             setLoading(false);
//             return;
//         }
//         if (newPassword !== confirmNewPassword) {
//             toast.error("New passwords do not match.");
//             setPasswordMismatchError(true);
//             setLoading(false);
//             return;
//         }
//         try {
//             console.log("Changing password for instructor:", instructorDetails.id);
//             await new Promise(resolve => setTimeout(resolve, 500));
//             toast.success("Password changed successfully!");
//             setIsEditingPassword(false);
//             setNewPassword('');
//             setConfirmNewPassword('');
//         } catch (err) {
//             toast.error(`Password change failed: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (!isEditingGeneral || !editableInstructorDetails) return;
//         setEditableInstructorDetails(prev => ({
//             ...prev,
//             name: `${prev.firstName || ''} ${prev.lastName || ''}`.trim()
//         }));
//     }, [editableInstructorDetails?.firstName, editableInstructorDetails?.lastName, isEditingGeneral]);

//     const handleEditClick = (section) => {
//         if (section === 'general') {
//             setEditableInstructorDetails({ ...instructorDetails });
//             setImagePreviewUrl(instructorDetails.profileImage);
//             setIsEditingGeneral(true);
//         } else if (section === 'password') {
//             setIsEditingPassword(true);
//         }
//     };

//     const handleCancelClick = (section) => {
//         if (section === 'general') {
//             setEditableInstructorDetails({ ...instructorDetails });
//             setImagePreviewUrl(instructorDetails.profileImage);
//             setIsEditingGeneral(false);
//         } else if (section === 'password') {
//             setNewPassword('');
//             setConfirmNewPassword('');
//             setIsEditingPassword(false);
//             setPasswordMismatchError(false);
//         }
//     };

//     const handleSaveClick = (section) => {
//         if (section === 'general') saveGeneralInfo();
//         else if (section === 'password') savePassword();
//     };
    
//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreviewUrl(reader.result);
//                 if (!isEditingGeneral) setIsEditingGeneral(true);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleUploadButtonClick = () => fileInputRef.current?.click();
//     const handleInputChange = (e) => setEditableInstructorDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
//     const handleConfirmPasswordChange = (e) => setConfirmNewPassword(e.target.value);
//     const togglePasswordVisibility = (field) => setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));

//     const currentData = isEditingGeneral ? editableInstructorDetails : instructorDetails;
    
//     const renderTextField = (label, name, value, isEditing, opts = {}) => (
//         <div className="form-group flex-1 min-w-[200px]">
//             <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
//             <input type={opts.type || "text"} name={name} value={value || ''} placeholder={opts.placeholder || label} onChange={handleInputChange} readOnly={!isEditing} disabled={loading} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditing ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}/>
//         </div>
//     );

//     const renderSelectField = (label, name, value, options, isEditing) => (
//         <div className="form-group flex-1 min-w-[200px]">
//             <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
//             {isEditing ? (
//                 <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 border rounded-md font-medium text-xs bg-white dark:bg-gray-700">
//                     {options.map(dept => <option key={dept.departmentId} value={dept.name}>{dept.name}</option>)}
//                 </select>
//             ) : (
//                 <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-md font-medium text-xs"/>
//             )}
//         </div>
//     );
    
//     const renderPasswordField = (label, name, value, onChange, fieldName) => (
//         <div className="form-group flex-1 min-w-[200px]">
//             <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
//             <div className="relative">
//                 <input type={passwordVisibility[fieldName] ? "text" : "password"} name={name} value={value} onChange={onChange} readOnly={!isEditingPassword} disabled={loading} className="form-input w-full py-2 px-3 border rounded-md font-medium text-xs"/>
//                 {isEditingPassword && ( <button type="button" onClick={() => togglePasswordVisibility(fieldName)} className="absolute inset-y-0 right-0 flex items-center pr-3">{passwordVisibility[fieldName] ? <EyeClosedIcon /> : <EyeOpenIcon />}</button> )}
//             </div>
//         </div>
//     );
    
//     return (
//         <div className='p-6 dark:text-white'>
//             <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Instructor Details</div>
//             <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
//             <div className="profile-section flex gap-8 mb-4 flex-wrap">
//                 <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
//                     <div className="avatar-content flex relative">
//                         {imagePreviewUrl ? ( <Image src={imagePreviewUrl} alt="Profile Preview" width={56} height={56} className="avatar-img w-14 h-14 rounded-full mr-3 object-cover" /> ) : ( <DefaultAvatarIcon className="avatar-img w-14 h-14 rounded-full mr-3" /> )}
//                         <span className={`avatar-img absolute left-[42px] bottom-[20px] block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${instructorDetails.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={`Status: ${instructorDetails.status}`}></span>
//                         <div className='avatar-info flex flex-col'>
//                             <div className='avatar-name font-semibold text-lg text-black dark:text-white mb-0.5'>
//                                 <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
//                             </div>
//                             <button type="button" onClick={handleUploadButtonClick} disabled={loading} className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
//                                 {loading ? 'Uploading...' : 'Upload Photo'}
//                             </button>
//                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
//                     <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
//                         <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">General Information</div>
//                         <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("First Name", "firstName", currentData.firstName, isEditingGeneral)}{renderTextField("Last Name", "lastName", currentData.lastName, isEditingGeneral)}</div>
//                         <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("Email", "email", currentData.email, false)}{renderTextField("Phone Number", "phone", currentData.phone, isEditingGeneral)}</div>
//                         <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("Major", "major", currentData.major, isEditingGeneral)}{renderTextField("Degree", "degree", currentData.degree, isEditingGeneral)}</div>
//                         <div className="form-row flex gap-3 mb-2 flex-wrap">{renderSelectField("Department", "department", currentData.department, allDepartments, isEditingGeneral)}{renderTextField("Address", "address", currentData.address, isEditingGeneral)}</div>
//                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
//                             {isEditingGeneral ? ( <> <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button><button onClick={() => handleSaveClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button> </> ) : ( <> <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}> Back </button> <button onClick={() => handleEditClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Edit Profile</button> </> )}
//                         </div>
//                     </div>

//                     <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
//                         <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">Password information</div>
//                         <div className="form-row flex gap-3 mb-2 flex-wrap">
//                             {renderPasswordField("New Password", "newPassword", newPassword, handleNewPasswordChange, "new")}
//                             {renderPasswordField( "Confirm New Password", "confirmNewPassword", handleConfirmPasswordChange, "confirm", passwordMismatchError )}
//                         </div>
//                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
//                              {isEditingPassword ? ( <> <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button><button onClick={() => handleSaveClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button> </> ) : ( <button onClick={() => handleEditClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Change Password</button> )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
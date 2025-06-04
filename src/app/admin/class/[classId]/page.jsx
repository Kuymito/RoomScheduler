'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

// --- Data Simulation ---
// This data is just for demonstration.
const initialClassData = [
    // Added semester to existing data
        { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: '2024-2025 S1', shift: '7:00 - 10:00', status: 'active' },
        { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: '2024-2025 S1', shift: '7:00 - 10:00', status: 'active' },
        { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', semester: '2024-2025 S1', shift: '8:00 - 11:00', status: 'active' },
        { id: 4, name: 'NUM32-03', generation: '32', group: '03', major: 'IS', degrees: 'Bachelor', faculty: 'Faculty of IS', semester: '2024-2025 S2', shift: '9:00 - 12:00', status: 'active' },
        { id: 5, name: 'NUM32-04', generation: '32', group: '04', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE', semester: '2024-2025 S2', shift: '13:00 - 16:00', status: 'active' },
        { id: 6, name: 'NUM32-05', generation: '32', group: '05', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI & R', semester: '2024-2025 S2', shift: '15:00 PM - 18:00', status: 'active' },
        { id: 7, name: 'NUM33-06', generation: '33', group: '06', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS', semester: '2024-2025 S3', shift: '17:00 - 20:00', status: 'active' },
        { id: 8, name: 'NUM33-07', generation: '33', group: '07', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML', semester: '2024-2025 S3', shift: '18:00 - 21:00', status: 'active' },
        { id: 9, name: 'NUM33-08', generation: '33', group: '08', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA', semester: '2024-2025 S3', shift: '19:00 - 22:00', status: 'archived' }, // Example archived
        { id: 10, name: 'NUM33-09', generation: '33', group: '09', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', semester: '2024-2025 S3', shift: '8:00 - 11:00', status: 'active' }
];

// --- Options for Dropdown Menus ---
// We define these here to use in our new select inputs.
const generationOptions = ['30', '31', '32', '33', '34', '35'];
const majorOptions = ['IT', 'CS', 'IS', 'SE', 'AI', 'DS', 'ML', 'DA'];
const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
const facultyOptions = ['Faculty of IT', 'Faculty of CS', 'Faculty of IS', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of SE'];
const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];
const shiftOptions = ['7:00 - 10:00', '8:00 - 11:00', '9:00 - 12:00', '13:00 - 16:00', '15:00 - 18:00', '17:00 - 20:00', '18:00 - 21:00', '19:00 - 22:00'];

const ClassDetailsContent = () => {
    const router = useRouter();
    const params = useParams();

    // State management is largely the same
    const [classDetails, setClassDetails] = useState(null);
    const [editableClassDetails, setEditableClassDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isNameManuallySet, setIsNameManuallySet] = useState(false);

    useEffect(() => {
        // Only run this logic if we are in edit mode and the name hasn't been manually set
        if (!isEditing || !editableClassDetails || isNameManuallySet) {
            return;
        }

        // Auto-update the name based on generation and group
        setEditableClassDetails(prev => ({
            ...prev,
            name: `NUM${prev.generation}-${prev.group}`
        }));

    }, [editableClassDetails?.generation, editableClassDetails?.group, isEditing, isNameManuallySet]);

    // API simulation functions are the same
    const fetchClassDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = initialClassData.find(cls => cls.id === id);
            if (data) {
                setClassDetails(data);
            } else {
                setError('Class not found.');
            }
        } catch (err) {
            setError("Failed to load class details.");
        } finally {
            setLoading(false);
        }
    };

    const saveClassDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            setClassDetails(editableClassDetails);
            setIsEditing(false);
            setSuccessMessage("Class details updated successfully!");
        } catch (err) {
            setError("Failed to save class details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const classIdFromUrl = params.classId;
        if (classIdFromUrl) {
            fetchClassDetails(parseInt(classIdFromUrl, 10));
        }
    }, [params.classId]);

    // UI handlers are the same
    const handleEditToggle = () => {
        if (isEditing) {
            saveClassDetails();
        } else {
            const initialEditableData = { ...classDetails };
            
            // Check if the initial name is the default format or custom
            const expectedName = `NUM${initialEditableData.generation}-${initialEditableData.group}`;
            if (initialEditableData.name !== expectedName) {
                setIsNameManuallySet(true);
            } else {
                setIsNameManuallySet(false);
            }

            setEditableClassDetails(initialEditableData);
            setIsEditing(true);
            setError(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'name') {
            if (value === '') {
                setIsNameManuallySet(false);
            } else {
                setIsNameManuallySet(true);
            }
        }
        
        setEditableClassDetails(prev => ({ ...prev, [name]: value }));
    };

    if (loading && !classDetails) {
        return <div className="p-6 dark:text-white">Loading class details...</div>;
    }

    if (!classDetails) {
        return <div className="p-6 text-red-500 dark:text-red-400">Error: {error}</div>;
    }
    
    const currentData = isEditing ? editableClassDetails : classDetails;

    const renderSelectField = (label, name, value, options) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
                />
            )}
        </div>
    );

    const renderTextField = (label, name, value) => (
         <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
                />
            )}
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
            {/* Header and messages are the same */}
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Class Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

            <div className="class-section flex gap-8 mb-4 flex-wrap">
                {/* Right Details Card with updated fields */}
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-mb text-num-dark-text dark:text-white mb-3">General Information</div>
                        
                        {/* --- UPDATED FORM SECTION --- */}
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Class Name", "name", currentData.name)}
                            {renderTextField("Group", "group", currentData.group)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Generation", "generation", currentData.generation, generationOptions)}
                            {renderSelectField("Major", "major", currentData.major, majorOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                             {renderSelectField("Degrees", "degrees", currentData.degrees, degreesOptions)}
                             {renderSelectField("Faculty", "faculty", currentData.faculty, facultyOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                             {renderSelectField("Semester", "semester", currentData.semester, semesterOptions)}
                             {renderSelectField("Shift", "shift", currentData.shift, shiftOptions)}
                        </div>

                        {/* Action Buttons are the same */}
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                             <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                Back
                            </button>
                            <button onClick={handleEditToggle} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Class"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ClassDetailsPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Details">
            <ClassDetailsContent />
        </AdminLayout>
    );
}
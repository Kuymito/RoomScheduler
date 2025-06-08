'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InstructorLayout from '@/components/InstructorLayout';

// --- FIX: Added status for data consistency ---
const initialClassData = [
    { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', shift: '7:00 - 10:00', status: 'active' },
    { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', shift: '7:00 - 10:00', status: 'active' },
    { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', shift: '8:00 - 11:00', status: 'archived' }
];

const generationOptions = ['30', '31', '32', '33', '34', '35'];
const majorOptions = ['IT', 'CS', 'IS', 'SE', 'AI', 'DS', 'ML', 'DA'];
const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
const facultyOptions = ['Faculty of IT', 'Faculty of CS', 'Faculty of IS', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of SE'];
const shiftOptions = ['7:00 - 10:00', '8:00 - 11:00', '9:00 - 12:00', '13:00 - 16:00', '15:00 - 18:00', '17:00 - 20:00', '18:00 - 21:00', '19:00 - 22:00'];

const InstructorClassDetailsContent = () => {
    const router = useRouter();
    const params = useParams();

    const [classDetails, setClassDetails] = useState(null);
    const [editableClassDetails, setEditableClassDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- FIX: Added state for success message ---
    const [successMessage, setSuccessMessage] = useState('');
    
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);

    useEffect(() => {
        if (!isEditing || !editableClassDetails || isNameManuallySet) {
            return;
        }
        setEditableClassDetails(prev => ({
            ...prev,
            name: `NUM${prev.generation}-${prev.group}`
        }));
    }, [editableClassDetails?.generation, editableClassDetails?.group, isEditing, isNameManuallySet]);

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
        setSuccessMessage('');
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            setClassDetails(editableClassDetails);
            setIsEditing(false);
            setSuccessMessage("Class details updated successfully!"); // Use the state setter
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
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

    const handleEditToggle = () => {
        if (isEditing) {
            saveClassDetails();
        } else {
            const initialEditableData = { ...classDetails };
            const expectedName = `NUM${initialEditableData.generation}-${initialEditableData.group}`;
            setIsNameManuallySet(initialEditableData.name !== expectedName);
            setEditableClassDetails(initialEditableData);
            setIsEditing(true);
            setError(null);
            setSuccessMessage('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setIsNameManuallySet(value !== '');
        }
        setEditableClassDetails(prev => ({ ...prev, [name]: value }));
    };

    if (loading && !classDetails) {
        return <div className="p-6 dark:text-white">Loading class details...</div>;
    }

    if (error && !classDetails) {
        return <div className="p-6 text-red-500 dark:text-red-400">Error: {error}</div>;
    }
    
    const currentData = isEditing ? editableClassDetails : classDetails;

    const renderSelectField = (label, name, value, options) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white">
                    {options.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-[14px] text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );

    const renderTextField = (label, name, value) => (
       <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            <input type="text" name={name} value={value} onChange={handleInputChange} readOnly={!isEditing} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white" />
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Class Details</div>
            <hr className="border-t border-gray-200 mt-4 mb-8" />

            <div className="class-section flex gap-8 mb-4 flex-wrap">
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">General Information</div>
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
                            {renderSelectField("Shift", "shift", currentData.shift, shiftOptions)}
                        </div>
                        
                        {/* --- FIX: Display success and error messages --- */}
                        {successMessage && <div className="mt-4 text-sm text-green-600 dark:text-green-400">{successMessage}</div>}
                        {error && <div className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                Back
                            </button>
                            <button onClick={handleEditToggle} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Class"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InstructorClassDetailsPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class Details">
            <InstructorClassDetailsContent />
        </InstructorLayout>
    );
}
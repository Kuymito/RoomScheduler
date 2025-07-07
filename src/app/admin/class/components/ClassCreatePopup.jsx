'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const ClassCreatePopup = ({ isOpen, onClose, onSave, departments, shifts }) => {
    const generationOptions = ['30', '31', '32', '33', '34', '35'];
    const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
    const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];
    
    const getInitialState = () => ({
        className: '',
        generation: generationOptions[0],
        groupName: '',
        degree: degreesOptions[0],
        semester: semesterOptions[0],
        departmentId: departments?.[0]?.departmentId || 0,
        shiftId: shifts?.[0]?.shiftId || 0,
        day: "Monday-Friday", // Default value as required by backend
        year: new Date().getFullYear(), // Default to current year
    });

    const [formData, setFormData] = useState(getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const popupRef = useRef(null);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        const processedValue = (name === 'departmentId' || name === 'shiftId')
            ? Number(value)
            : value;
        setFormData(previousState => ({ ...previousState, [name]: processedValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const selectedDepartment = departments.find(department => department.departmentId === formData.departmentId);
        if (!selectedDepartment) {
            toast.error("A valid major must be selected.");
            return;
        }

        let finalClassName = formData.className.trim();
        if (!finalClassName) {
            if (!formData.generation || !formData.groupName.trim()) {
                toast.error('Class Name is required, or provide Generation and Group to auto-generate one.');
                return;
            }
            finalClassName = `NUM${formData.generation}-${formData.groupName}`;
        }
        
        const payload = {
            ...formData,
            className: finalClassName,
            // Add the 'major' name string to the payload, as required by the backend
            major: selectedDepartment.name,
        };

        setIsSaving(true);
        try {
            await onSave(payload);
            onClose(); // Close the popup only on successful save
        } catch (error) {
            // The parent component will show a toast, but we log here for debugging.
            console.error("Failed to save class:", error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, departments, shifts]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-3">Create New Class</h2>
                <hr className="border-t-2 border-gray-200 mb-5" />
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="col-span-2">
                            <label htmlFor="className" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name (Optional)</label>
                            <input
                                type="text"
                                id="className"
                                name="className"
                                value={formData.className}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                placeholder="e.g., NUM32-01 or a custom name"
                            />
                        </div>
                        <div>
                            <label htmlFor="generation" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Generation</label>
                            <select id="generation" name="generation" value={formData.generation} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" required>
                                {generationOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="groupName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <input type="text" id="groupName" name="groupName" value={formData.groupName} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" placeholder="01" required />
                        </div>
                        <div>
                            <label htmlFor="degree" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="degree" name="degree" value={formData.degree} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" required>
                                {degreesOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="departmentId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" required>
                                {departments?.map(department => (
                                    <option key={department.departmentId} value={department.departmentId}>{department.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="semester" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Semester</label>
                            <select id="semester" name="semester" value={formData.semester} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" required>
                                {semesterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="shiftId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Shift</label>
                            <select id="shiftId" name="shiftId" value={formData.shiftId} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" required>
                            <option key={shifts.shiftId} value={shifts.shiftId}>
                                {shifts.name || `Shift ${shifts.shiftId}`} ({shifts.startTime} - {shifts.endTime})
                            </option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassCreatePopup;
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

const InstructorCreatePopup = ({ isOpen, onClose, onSave, departments, departmentsError }) => {
    // Define options for select fields
    const qualificationOptions = ['Master', 'PhD', 'Doctor'];

    // Use the fetched department names for the Major dropdown options
    const majorOptions = useMemo(() => {
        if (!departments) return [];
        return departments.map(dep => dep.name);
    }, [departments]);

    // Function to get the initial state for the form
    const getInitialState = () => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        degree: qualificationOptions[0],
        major: majorOptions[0] || '',
        address: '',
        departmentId: departments?.[0]?.departmentId || '',
        password: '',
        // Default values as per API requirements
        roleId: 2,
        profile: '',
    });

    const [newInstructor, setNewInstructor] = useState(getInitialState());
    const popupRef = useRef(null);

    // Effect to reset form state when departments load or when the popup opens
    useEffect(() => {
        if (isOpen) {
            setNewInstructor(getInitialState());
        }
    }, [isOpen, departments]);

    // Handle changes to form input/select fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInstructor(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!newInstructor.firstName.trim() || !newInstructor.lastName.trim() || !newInstructor.email.trim() || !newInstructor.phone.trim() || !newInstructor.major || !newInstructor.degree || !newInstructor.address.trim() || !newInstructor.departmentId || !newInstructor.password) {
            alert('Please fill in all required fields.');
            return;
        }

        // Construct the payload for the API
        const payload = {
            ...newInstructor,
            departmentId: Number(newInstructor.departmentId),
        };

        onSave(payload);
        onClose();
    };

    // Effect to handle clicks outside the popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Instructor</h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3 mb-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="firstName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={newInstructor.firstName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="John" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={newInstructor.lastName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="Doe" required />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="email" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" name="email" value={newInstructor.email} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="john.doe@example.com" required />
                        </div>
                         <div className="col-span-2">
                            <label htmlFor="password" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" id="password" name="password" value={newInstructor.password} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="••••••••" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="text" id="phone" name="phone" value={newInstructor.phone} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="+855 12 345 678" required />
                        </div>
                        <div>
                            <label htmlFor="degree" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="degree" name="degree" value={newInstructor.degree} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required>
                                {qualificationOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="major" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select id="major" name="major" value={newInstructor.major} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required>
                                {departmentsError && <option value="">Error loading majors</option>}
                                {!departments && !departmentsError && <option value="">Loading...</option>}
                                {majorOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="departmentId" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select id="departmentId" name="departmentId" value={newInstructor.departmentId} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required>
                                {departmentsError && <option value="">Error loading departments</option>}
                                {!departments && !departmentsError && <option value="">Loading...</option>}
                                {departments && departments.map(dep => (<option key={dep.departmentId} value={dep.departmentId}>{dep.name}</option>))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input id="address" name="address" value={newInstructor.address} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" placeholder="123 Main Street, City, Country" required />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Create Instructor</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreatePopup;
'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Corrected Imports ---
import AdminLayout from '@/components/AdminLayout';
import ClassDetailSkeleton from '../components/ClassDetailSkeleton';
import * as classService from '@/services/classService';
import * as instructorService from '@/services/instructorService';


// --- Hardcoded Options & Mock Data ---
const generationOptions = ['30', '31', '32', '33', '34', '35'];
const majorOptions = ['IT', 'CS', 'IS', 'SE', 'AI', 'DS', 'ML', 'DA'];
const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
const facultyOptions = ['Faculty of IT', 'Faculty of CS', 'Faculty of IS', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of SE'];
const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];
const shiftOptions = ['7:00 - 10:00', '8:00 - 11:00', '9:00 - 12:00', '13:00 - 16:00', '15:00 - 18:00', '17:00 - 20:00', '18:00 - 21:00', '19:00 - 22:00'];
const statusOptions = ['Active', 'Archived'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const studyModes = [
    { value: 'in-class', label: 'In Class' },
    { value: 'online', label: 'Online' },
];
const initialInstructorsData = [
    { id: 'inst1', name: 'Dr. Evelyn Reed', profileImage: '/images/admin.jpg', degree: 'PhD' },
    { id: 'inst2', name: 'Prof. Samuel Green', profileImage: null, degree: 'Master' },
    { id: 'inst3', name: 'Ms. Olivia Blue', profileImage: '', degree: 'Associate' },
];


// --- UI Components ---
const DefaultAvatarIcon = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-500 dark:text-gray-400 border border-gray-300 rounded-full p-1 dark:border-gray-600`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const ScheduledInstructorCard = ({ instructorData, day, onDragStart, onDragEnd, onRemove, studyMode, onStudyModeChange }) => {
    if (!instructorData || !instructorData.instructor) return null;
    const { instructor } = instructorData;
    const baseCardClasses = "w-full p-2 rounded-md shadow text-center flex flex-col items-center cursor-grab active:cursor-grabbing group relative transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border-2";
    let colorCardClasses = studyMode === 'in-class' ? "bg-green-100 dark:bg-green-800 border-green-500 dark:border-green-700" : "bg-orange-100 dark:bg-orange-800 border-orange-500 dark:border-orange-700";
    let cardTextColorClasses = studyMode === 'in-class' ? "text-green-800 dark:text-green-100" : "text-orange-800 dark:text-orange-100";
    const baseSelectClasses = "block w-full p-1.5 text-xs rounded-md shadow-sm transition-colors";
    let colorSelectClasses = studyMode === 'in-class' ? "bg-green-50 dark:bg-green-700 border-green-400 dark:border-green-600 text-green-700 dark:text-green-100 focus:ring-green-500 focus:border-green-500" : "bg-orange-50 dark:bg-orange-700 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-100 focus:ring-orange-500 focus:border-orange-500";

    return (
        <div className="w-full flex flex-col items-center">
            <div className="mb-3 w-full">
                <label htmlFor={`studyMode-${day}`} className="sr-only">Study Mode for {day}</label>
                <select id={`studyMode-${day}`} name={`studyMode-${day}`} value={studyMode} onChange={(e) => onStudyModeChange(day, e.target.value)} className={`${baseSelectClasses} ${colorSelectClasses}`}>
                    {studyModes.map(mode => (<option key={mode.value} value={mode.value}>{mode.label}</option>))}
                </select>
            </div>
            <div draggable onDragStart={(e) => onDragStart(e, instructor, day)} onDragEnd={onDragEnd} className={`${baseCardClasses} ${colorCardClasses}`}>
                {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-400 mb-1" />) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0 flex items-center justify-center mb-1`} />)}
                <p className={`text-sm font-semibold break-words ${cardTextColorClasses}`}>{instructor.name}</p>
                {instructor.degree && (<p className={`text-xs mt-0.5 ${cardTextColorClasses} opacity-80`}>{instructor.degree}</p>)}
                <button onClick={() => onRemove(day)} className="absolute top-1 right-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 p-1 bg-white/70 dark:bg-gray-900/70 rounded-full leading-none" title={`Remove ${instructor.name}`} aria-label={`Remove ${instructor.name}`}>&#x2715;</button>
            </div>
        </div>
    );
};


const ClassDetailsContent = () => {
    // --- State Variables ---
    const router = useRouter();
    const params = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [editableClassDetails, setEditableClassDetails] = useState(null);
    const [allInstructors, setAllInstructors] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);
    const [schedule, setSchedule] = useState(() => daysOfWeek.reduce((acc, day) => { acc[day] = null; return acc; }, {}));
    const [initialScheduleForCheck, setInitialScheduleForCheck] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const saveStatusRef = useRef(saveStatus);
    const currentData = isEditing ? editableClassDetails : classDetails;

    // --- Data Fetching & Formatting ---
    const formatClassDetailsForState = (apiData) => {
        if (!apiData) return null;
        return {
            id: apiData.classId,
            name: apiData.className,
            generation: apiData.generation,
            group: apiData.groupName,
            major: apiData.majorName,
            degrees: apiData.degreeName,
            faculty: apiData.department?.name || 'N/A',
            semester: apiData.semester || 'N/A',
            shift: `${apiData.shift?.startTime || ''} - ${apiData.shift?.endTime || ''}`,
            status: apiData.archived ? 'Archived' : 'Active',
        };
    };

    useEffect(() => {
        const classId = params.classId;
        if (!classId) {
            setError("No Class ID found in URL.");
            setLoading(false);
            return;
        }
        const loadPageData = async () => {
            setLoading(true);
            setError(null);
            try {
                const classDataFromApi = await classService.getClassById(Number(classId));
                // Using a mock instructor list for now, replace with real service call when ready
                // const instructorsFromApi = await instructorService.getAllInstructors();
                const instructorsFromApi = initialInstructorsData; 

                const formattedDetails = formatClassDetailsForState(classDataFromApi);
                setClassDetails(formattedDetails);
                setAllInstructors(instructorsFromApi);
                
                setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
            } catch (err) {
                setError(err.message);
                console.error("Failed to load page data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [params.classId]);
    
    // --- Handlers ---
    const saveClassDetails = async () => {
        if (!editableClassDetails) return;
        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                 className: editableClassDetails.name,
                 generation: editableClassDetails.generation,
                 groupName: editableClassDetails.group,
            };
            const updatedClass = await classService.updateClassDetails(classDetails.id, payload);
            setClassDetails(formatClassDetailsForState(updatedClass));
            setIsEditing(false);
            setSaveMessage("Class details updated successfully!");
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            setError("Failed to save class details: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

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
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditableClassDetails(null);
        setIsNameManuallySet(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setIsNameManuallySet(value !== '');
        }
        setEditableClassDetails(prev => ({ ...prev, [name]: value }));
    };

    const availableInstructors = useMemo(() => {
        const assignedInstructorIds = new Set(Object.values(schedule).filter(s => s?.instructor).map(s => s.instructor.id));
        let filtered = allInstructors.filter(instructor => !assignedInstructorIds.has(instructor.id));
        if (searchTerm.trim() !== '') {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(instructor =>
                instructor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (instructor.degree && instructor.degree.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        return filtered;
    }, [schedule, searchTerm, allInstructors]);

    // --- Drag and Drop Handlers ---
    const handleNewInstructorDragStart = (e, instructor) => {
        setDraggedItem({ item: instructor, type: 'new' });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(instructor));
        e.currentTarget.classList.add('opacity-60', 'scale-95');
    };
    const handleNewInstructorDragEnd = (e) => {
        if (draggedItem?.type === 'new') setDraggedItem(null);
        e.currentTarget.classList.remove('opacity-60', 'scale-95');
        setDragOverDay(null);
    };
    const handleScheduledInstructorDragStart = (e, instructor, originDay) => {
        setDraggedItem({ item: instructor, type: 'scheduled', originDay: originDay });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ ...instructor, originDay }));
    };
    const handleScheduledInstructorDragEnd = (e) => {
        if (draggedItem?.type === 'scheduled' && e.dataTransfer.dropEffect === 'none') {
            setSchedule(prevSchedule => ({ ...prevSchedule, [draggedItem.originDay]: null }));
        }
        setDraggedItem(null); setDragOverDay(null);
    };
    const handleDayDragOver = (e) => { e.preventDefault(); if (draggedItem) e.dataTransfer.dropEffect = 'move'; };
    const handleDayDragEnter = (e, day) => { e.preventDefault(); if (draggedItem) setDragOverDay(day); };
    const handleDayDragLeave = (e, day) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        if (dragOverDay === day) setDragOverDay(null);
    };
    const handleDayDrop = (e, targetDay) => {
        e.preventDefault();
        if (!draggedItem) return;
        const newSchedule = { ...schedule };
        if (draggedItem.type === 'new') {
            newSchedule[targetDay] = { instructor: draggedItem.item, studyMode: studyModes[0].value };
        } else if (draggedItem.type === 'scheduled') {
            const originDay = draggedItem.originDay;
            if (originDay === targetDay) { setDragOverDay(null); return; }
            const dataFromOriginDay = schedule[originDay];
            const dataFromTargetDay = schedule[targetDay];
            if (dataFromTargetDay?.instructor) { // SWAP
                newSchedule[originDay] = { instructor: dataFromTargetDay.instructor, studyMode: dataFromTargetDay.studyMode };
                newSchedule[targetDay] = { instructor: draggedItem.item, studyMode: dataFromOriginDay.studyMode };
            } else { // MOVE TO EMPTY
                newSchedule[targetDay] = { instructor: draggedItem.item, studyMode: dataFromOriginDay.studyMode };
                if (originDay) newSchedule[originDay] = null;
            }
        }
        setSchedule(newSchedule);
        setDragOverDay(null);
    };
    const handleRemoveInstructorFromDay = (day) => { setSchedule(prevSchedule => ({ ...prevSchedule, [day]: null })); };
    const handleStudyModeChange = (day, newMode) => {
        setSchedule(prevSchedule => {
            if (prevSchedule[day]?.instructor) {
                return { ...prevSchedule, [day]: { ...prevSchedule[day], studyMode: newMode } };
            }
            return prevSchedule;
        });
    };

    const handleSaveSchedule = async () => {
        setIsSaving(true);
        setSaveStatus('saving');
        setSaveMessage('Saving schedule...');
        const schedulePayload = {
            scheduleItems: Object.entries(schedule)
                .filter(([_, dayData]) => dayData?.instructor)
                .map(([day, dayData]) => ({ 
                    dayOfWeek: day.toUpperCase(), 
                    instructorId: dayData.instructor.id, 
                    isOnline: dayData.studyMode === 'online'
                }))
        };
        try {
            await classService.saveSchedule(classDetails.id, schedulePayload);
            setSaveStatus('success');
            setSaveMessage('Schedule saved successfully!');
            setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
        } catch (error) {
            console.error('Failed to save schedule:', error);
            setSaveStatus('error');
            setSaveMessage(error.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                if (saveStatusRef.current !== 'saving') {
                    setSaveMessage('');
                    setSaveStatus('');
                }
            }, 5000);
        }
    };

    const handleDownloadSchedule = async () => {
        const schedulePanelElement = document.getElementById('weeklySchedulePanel');
        if (!schedulePanelElement) return alert("Error: Schedule panel element not found.");
        if (Object.values(schedule).every(dayData => !dayData?.instructor)) return alert("Schedule is empty. Nothing to download.");
        alert("Generating PDF, please wait... ⏳");
        try {
            const canvas = await html2canvas(schedulePanelElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const orientation = canvas.width > canvas.height ? 'l' : 'p';
            const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            let newImgWidth = pdfWidth - 40;
            let newImgHeight = newImgWidth / ratio;
            if (newImgHeight > pdfHeight - 40) {
                newImgHeight = pdfHeight - 40;
                newImgWidth = newImgHeight * ratio;
            }
            const xOffset = (pdfWidth - newImgWidth) / 2;
            const yOffset = (pdfHeight - newImgHeight) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, newImgWidth, newImgHeight);
            pdf.save(`schedule_${classDetails.name}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF.");
        }
    };

    const renderSelectField = (label, name, value, options) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white">
                    {options.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
            ) : (
                <input type="text" value={value || 'N/A'} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"/>
            )}
        </div>
    );
    const renderTextField = (label, name, value) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <input type="text" name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"/>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"/>
            )}
        </div>
    );
    
    // --- UseEffect Hooks for UI Logic ---
    useEffect(() => {
        if (!isEditing || !editableClassDetails || isNameManuallySet) return;
        setEditableClassDetails(prev => ({ ...prev, name: `NUM${prev.generation}-${prev.group}` }));
    }, [editableClassDetails?.generation, editableClassDetails?.group, isEditing, isNameManuallySet]);
    useEffect(() => { saveStatusRef.current = saveStatus; }, [saveStatus]);
    useEffect(() => {
        if (initialScheduleForCheck) {
            setIsDirty(JSON.stringify(schedule) !== JSON.stringify(initialScheduleForCheck));
        } else {
            setIsDirty(false);
        }
    }, [schedule, initialScheduleForCheck]);
    
    // --- Render Logic ---
    if (loading && !classDetails) return <ClassDetailSkeleton />;
    if (error) return <div className="p-6 text-red-500 dark:text-red-400">Error: {error}</div>;
    if (!classDetails) return <div className="p-6 text-center">Class not found.</div>;
    
    let saveButtonBaseClasses = "w-full sm:w-auto px-6 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform active:scale-95";
    let saveButtonColorClasses = isSaving ? "bg-gray-400 opacity-60 cursor-not-allowed" : isDirty ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" : "bg-gray-400 opacity-80 cursor-not-allowed";
    let downloadButtonBaseClasses = "w-full sm:w-auto px-6 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out transform active:scale-95";
    let downloadButtonColorClasses = isSaving ? "bg-gray-300 opacity-60 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400";
    const scheduleIsEmpty = Object.values(schedule).every(dayData => !dayData?.instructor);
    
    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-1">Class Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-2 mb-4" />
            <div className="class-section flex flex-col gap-6">
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-md text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Class Name", "name", currentData.name)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Group", "group", currentData.group)}
                            {renderSelectField("Generation", "generation", currentData.generation, generationOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Faculty", "faculty", currentData.faculty, facultyOptions)}
                            {renderSelectField("Degrees", "degrees", currentData.degrees, degreesOptions)}
                            {renderSelectField("Major", "major", currentData.major, majorOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Semester", "semester", currentData.semester, semesterOptions)}
                            {renderSelectField("Shift", "shift", currentData.shift, shiftOptions)}
                            {renderSelectField("Status", "status", currentData.status, statusOptions)}
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancelClick} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={isSaving}>Cancel</button>
                                    <button onClick={handleEditToggle} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Back</button>
                                    <button onClick={handleEditToggle} className="edit-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Edit Class</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex-grow flex flex-col lg:flex-row gap-6 min-w-[300px]'>
                    <div className='h-[530px] lg:w-[250px] xl:w-[280px] flex-shrink-0 p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg self-start flex flex-col'>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Available Instructors</h3>
                            <div className="my-3"><input type="text" placeholder="Search by name or degree..." className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                        </div>
                        <div className="space-y-3 flex-grow overflow-y-auto pr-1 min-h-[200px]">
                            {availableInstructors.length > 0 ? availableInstructors.map((instructor) => (
                                <div key={instructor.id} draggable onDragStart={(e) => handleNewInstructorDragStart(e, instructor)} onDragEnd={handleNewInstructorDragEnd} className="p-3 bg-sky-50 dark:bg-sky-700 dark:hover:bg-sky-600 border border-sky-200 dark:border-sky-600 rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-150 ease-in-out flex items-center gap-3 group">
                                    {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"/>) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0`} /> )}
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-sky-800 dark:text-sky-100 group-hover:text-sky-900 dark:group-hover:text-white">{instructor.name}</p>
                                        {instructor.degree && (<p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{instructor.degree}</p>)}
                                    </div>
                                </div>)) : 
                                (<p className="text-sm text-gray-500 dark:text-gray-400 italic">{searchTerm ? 'No matching instructors found.' : 'No instructors available.'}</p>)}
                        </div>
                    </div>
                    <div id="weeklySchedulePanel" className='flex-1 p-4 sm:p-6 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex flex-col'>
                        <h3 className="text-base sm:text-lg font-semibold mb-6 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Weekly Class Schedule</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
                            {daysOfWeek.map((day) => (
                                <div key={day} onDragOver={handleDayDragOver} onDragEnter={(e) => handleDayDragEnter(e, day)} onDragLeave={(e) => handleDayDragLeave(e, day)} onDrop={(e) => handleDayDrop(e, day)} className={`p-3 rounded-lg min-h-[160px] sm:min-h-[220px] flex flex-col justify-start items-center group border-2 transition-all duration-200 ease-in-out ${dragOverDay === day && draggedItem ? 'bg-emerald-50 dark:bg-emerald-800 border-emerald-400' : 'bg-gray-50 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600'}`}>
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 select-none pt-1">{day}</h4>
                                    {schedule[day]?.instructor ? (<ScheduledInstructorCard instructorData={schedule[day]} day={day} onDragStart={handleScheduledInstructorDragStart} onDragEnd={handleScheduledInstructorDragEnd} onRemove={handleRemoveInstructorFromDay} studyMode={schedule[day].studyMode} onStudyModeChange={handleStudyModeChange}/>) : 
                                    (<div className="flex-grow flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic select-none px-2 text-center">Drag instructor here</div>)}
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
                                <ul className="list-disc text-xs mb-4 ml-3">
                                    <li>Generation: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.generation}</span></li>
                                    <li>Group: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.group}</span></li>
                                    <li>Semester: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.semester}</span></li>
                                    <li>Shift: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.shift}</span></li>
                                </ul>
                                <button onClick={handleSaveSchedule} disabled={isSaving || !isDirty} className={`${saveButtonBaseClasses} ${saveButtonColorClasses}`}>
                                    {isSaving ? ( <span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</span>) : 'Save Schedule'}
                                </button>
                                {saveMessage && (<p className={`text-xs w-full text-center sm:text-left ${saveStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</p>)}
                            </div>
                            <div className="flex flex-col items-end gap-1 w-full sm:w-auto mt-24">
                                <button onClick={handleDownloadSchedule} className={`${downloadButtonBaseClasses} ${downloadButtonColorClasses}`} disabled={isSaving || scheduleIsEmpty}>Download Schedule</button>
                            </div>
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
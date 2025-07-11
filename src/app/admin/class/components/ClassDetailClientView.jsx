'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { classService } from '@/services/class.service';
import { useSession } from 'next-auth/react';
import SuccessPopup from '../../profile/components/SuccessPopup';

const DefaultAvatarIcon = ({ className = "w-9 h-9" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 9 0 0 1 12 21a8.966 9 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const shiftMap = {
    'Morning Shift': 1,
    'Noon Shift': 2,
    'Afternoon Shift': 3,
    'Evening Shift': 4,
    'Weekend Shift': 5
};

const clientDayToApiDay = {
    Mon: 'MONDAY',
    Tue: 'TUESDAY',
    Wed: 'WEDNESDAY',
    Thur: 'THURSDAY',
    Fri: 'FRIDAY',
    Sat: 'SATURDAY',
    Sun: 'SUNDAY',
};

// --- Integrated Error Toast Component ---
const ErrorToast = ({ show, message, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-close after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed top-24 right-6 bg-red-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-scale">
            <div className="flex items-center justify-between">
                <p className="font-semibold mr-4">{message}</p>
                <button onClick={onClose} className="-mr-1 p-1 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white">
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


const ScheduledInstructorCard = ({ instructorData, day, onDragStart, onDragEnd, onRemove, studyMode, onStudyModeChange }) => {
    if (!instructorData || !instructorData.instructor) return null;
    const { instructor } = instructorData;
    const studyModes = [ { value: 'in-class', label: 'In Class' }, { value: 'online', label: 'Online' } ];
    const baseCardClasses = "w-full p-2 rounded-md shadow text-center flex flex-col items-center cursor-grab active:cursor-grabbing group relative transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border";
    let colorCardClasses = "";
    let cardTextColorClasses = "";
    const baseSelectClasses = "block w-full p-1.5 text-xs rounded-md shadow-sm transition-colors";
    let colorSelectClasses = "";

    if (studyMode === 'in-class') {
        colorCardClasses = "bg-green-100 dark:bg-green-800 border-green-500 dark:border-green-700";
        cardTextColorClasses = "text-green-800 dark:text-green-100";
        colorSelectClasses = "bg-green-50 dark:bg-green-700 border-green-400 dark:border-green-600 text-green-700 dark:text-green-100 focus:ring-green-500 focus:border-green-500";
    } else if (studyMode === 'online') {
        colorCardClasses = "bg-orange-100 dark:bg-orange-800 border-orange-500 dark:border-orange-700";
        cardTextColorClasses = "text-orange-800 dark:text-orange-100";
        colorSelectClasses = "bg-orange-50 dark:bg-orange-700 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-100 focus:ring-orange-500 focus:border-orange-500";
    }

    return (
        <div className="w-full flex flex-col">
            <div className="mb-5 w-full relative">
                <label htmlFor={`studyMode-${day}`} className="sr-only">Study Mode for {day}</label>
                {/* This is the interactive dropdown for the live page */}
                <select
                    id={`studyMode-${day}`}
                    name={`studyMode-${day}`}
                    value={studyMode}
                    onChange={(e) => onStudyModeChange(day, e.target.value)}
                    className={`${baseSelectClasses} ${colorSelectClasses} w-full h-auto study-mode-select`} // Added 'study-mode-select' class
                >
                    {studyModes.map(mode => (<option key={mode.value} value={mode.value}>{mode.label}</option>))}
                </select>
                {/* This is the static text for the PDF, normally hidden */}
                <div className={`pdf-only-text ${cardTextColorClasses} p-1.5 text-xs text-center font-medium`}>
                    {studyModes.find(m => m.value === studyMode)?.label}
                </div>
            </div>
            <div draggable onDragStart={(e) => onDragStart(e, instructor, day)} onDragEnd={onDragEnd} className={`${baseCardClasses} ${colorCardClasses}`}>
                {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-400 mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; const sibling = e.currentTarget.nextSibling; if(sibling) sibling.style.display = 'flex'; }}/>) : null}
                {!instructor.profileImage && <DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0 flex items-center justify-center mb-1`} /> }
                <p className={`text-sm font-semibold break-words ${cardTextColorClasses}`}>{instructor.name}</p>
                {instructor.degree && (<p className={`text-xs mt-0.5 ${cardTextColorClasses} opacity-80`}>{instructor.degree}</p>)}
                <button onClick={() => onRemove(day)} className="absolute top-1 right-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 p-1 bg-white/70 dark:bg-gray-900/70 rounded-full leading-none" title={`Remove ${instructor.name}`} aria-label={`Remove ${instructor.name}`}>✕</button>
            </div>
        </div>
    );
};

export default function ClassDetailClientView({ initialClassDetails, allInstructors, allDepartments, initialSchedule }) {
    const router = useRouter();
    const { data: session } = useSession();
    
    const [classData, setClassData] = useState(initialClassDetails);
    const [backupData, setBackupData] = useState(null); 

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successPopupMessage, setSuccessPopupMessage] = useState('');
    const [errorToast, setErrorToast] = useState({ show: false, message: '' });
    
    const daysOfWeek = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'], []);
    
    const [schedule, setSchedule] = useState(() => {
        const initialState = {};
        daysOfWeek.forEach(day => {
            initialState[day] = initialSchedule[day] || null;
        });
        return initialState;
    });

    const [initialScheduleForCheck, setInitialScheduleForCheck] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const saveStatusRef = useRef(saveStatus);
    const [selectedDegree, setSelectedDegree] = useState('All');
    
  
    const [isPreparingPdf, setIsPreparingPdf] = useState(false);

    const generationOptions = ['29','30', '31', '32', '33'];
    const degreesOptions = ['Bachelor', 'Master', 'PhD', 'Doctor'];
    const shiftOptions = Object.keys(shiftMap);
    const departmentOptions = useMemo(() => allDepartments || [], [allDepartments]);
    const majorOptions = useMemo(() => departmentOptions, [departmentOptions]);
    const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
    const statusOptions = ['Active', 'Archived'];

    const degreeFilterOptions = ['All', ...degreesOptions];

    const isWeekendShift = classData.shift?.includes('Weekend');

    const availableInstructors = useMemo(() => {
        if (!allInstructors || !Array.isArray(allInstructors)) return [];
        const assignedInstructorIds = new Set(Object.values(schedule).filter(day => day?.instructor).map(day => day.instructor.id));
        let filtered = allInstructors.filter(instructor => !assignedInstructorIds.has(instructor.id));
        if (selectedDegree !== 'All') filtered = filtered.filter(instructor => instructor.degree === selectedDegree);
        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(instructor =>
                instructor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (instructor.degree && instructor.degree.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        return filtered;
    }, [schedule, searchTerm, allInstructors, selectedDegree]);

    useEffect(() => {
        if (!isEditing || !classData || isNameManuallySet) return;
        setClassData(prev => ({ ...prev, name: `NUM${prev.generation}-${prev.group}` }));
    }, [isEditing, isNameManuallySet, classData?.generation, classData?.group]);
    
    useEffect(() => { saveStatusRef.current = saveStatus; }, [saveStatus]);

    useEffect(() => {
        setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
    }, []);

    useEffect(() => {
        if (initialScheduleForCheck) setIsDirty(JSON.stringify(schedule) !== JSON.stringify(initialScheduleForCheck));
        else setIsDirty(false);
    }, [schedule, initialScheduleForCheck]);

    const handleEditToggle = () => {
        if (!isEditing) {
            setBackupData(JSON.parse(JSON.stringify(classData)));
            const expectedName = `NUM${classData.generation}-${classData.group}`;
            setIsNameManuallySet(classData.name !== expectedName);
            setIsEditing(true);
            setError('');
        }
    };
    
    const handleCancelClick = () => {
        if (backupData) setClassData(backupData);
        setIsEditing(false);
        setBackupData(null); 
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') setIsNameManuallySet(value !== `NUM${classData.generation}-${classData.group}`);
        setClassData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveDetails = async () => {
        setLoading(true);
        setError('');

        if (!session?.accessToken) {
            setError("You are not authenticated.");
            setLoading(false);
            return;
        }

        const selectedDepartment = allDepartments.find(dep => dep.name === classData.faculty);
        if (!selectedDepartment) {
            setError("Invalid department selected.");
            setLoading(false);
            return;
        }
        
        const shiftIdValue = shiftMap[classData.shift];
        
        if (!shiftIdValue) {
            setError("Invalid shift selected.");
            setLoading(false);
            return;
        }

        const apiPayload = {
            className: classData.name,
            generation: classData.generation,
            groupName: classData.group,
            major: classData.major,
            degree: classData.degrees,
            semester: classData.semester,
            day: "Monday",
            year: 1,
            departmentId: selectedDepartment.departmentId,
            shiftId: shiftIdValue,
            isArchived: classData.status === 'Archived',
            publishDate: classData.publishDate,
        };

        try {
            await classService.patchClass(classData.id, apiPayload, session.accessToken);
            setSuccessPopupMessage("Class details have been updated successfully.");
            setShowSuccessPopup(true);
            setIsEditing(false);
            setBackupData(null);
        } catch (err) {
            setError(err.message || "Failed to update class.");
            if (backupData) setClassData(backupData);
        } finally {
            setLoading(false);
        }
    };
    
    const renderSelectField = (label, name, value, options, keyField, valueField, labelField) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white">
                    {options.map(option => {
                        const optionKey = keyField ? option[keyField] : (typeof option === 'object' ? JSON.stringify(option) : option);
                        const optionValue = valueField ? option[valueField] : option;
                        const optionLabel = labelField ? option[labelField] : option;
                        return <option key={optionKey} value={optionValue}>{optionLabel}</option>;
                    })}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"/>
            )}
        </div>
    );
    
    const renderTextField = (label, name, value) => (
           <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <input type="text" name={name} value={value || ''} onChange={handleInputChange} readOnly={!isEditing} disabled={loading} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}/>
        </div>
    );

    const renderDateField = (label, name, value) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <input
                type={isEditing ? 'date' : 'text'}
                name={name}
                value={isEditing ? (value ? new Date(value).toISOString().split('T')[0] : '') : (value ? new Date(value).toLocaleDateString('en-CA') : 'N/A')}
                onChange={handleInputChange}
                readOnly={!isEditing}
                disabled={loading}
                className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
            />
        </div>
    );

    const handleNewInstructorDragStart = (e, instructor) => { setDraggedItem({ item: instructor, type: 'new' }); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('application/json', JSON.stringify(instructor)); e.currentTarget.classList.add('opacity-60', 'scale-95'); };
    const handleNewInstructorDragEnd = (e) => { if (draggedItem?.type === 'new') setDraggedItem(null); e.currentTarget.classList.remove('opacity-60', 'scale-95'); setDragOverDay(null); };
    const handleScheduledInstructorDragStart = (e, instructor, originDay) => { setDraggedItem({ item: instructor, type: 'scheduled', originDay: originDay }); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('application/json', JSON.stringify({ ...instructor, originDay })); };
    
    const handleScheduledInstructorDragEnd = (e) => {
        if (draggedItem?.type === 'scheduled' && e.dataTransfer.dropEffect === 'none') {
            setSchedule(prevSchedule => ({ ...prevSchedule, [draggedItem.originDay]: null }));
        }
        setDraggedItem(null);
        setDragOverDay(null);
    };

    const handleDayDragOver = (e) => { e.preventDefault(); if (draggedItem) e.dataTransfer.dropEffect = 'move'; };
    const handleDayDragEnter = (e, day) => { e.preventDefault(); if (draggedItem) setDragOverDay(day); };
    const handleDayDragLeave = (e, day) => { if (e.currentTarget.contains(e.relatedTarget)) return; if (dragOverDay === day) setDragOverDay(null); };
    
    const handleDayDrop = (e, targetDay) => {
        e.preventDefault();
        if (!draggedItem) return;
    
        const isTargetWeekend = targetDay === 'Sat' || targetDay === 'Sun';
        if ((isWeekendShift && !isTargetWeekend) || (!isWeekendShift && isTargetWeekend)) {
            setDragOverDay(null);
            return;
        }
    
        const newSchedule = { ...schedule };
        if (draggedItem.type === 'new') {
            newSchedule[targetDay] = { instructor: {id: draggedItem.item.id, name: draggedItem.item.name, profileImage: draggedItem.item.profileImage, degree: draggedItem.item.degree}, studyMode: 'in-class', };
        } else if (draggedItem.type === 'scheduled') {
            const originDay = draggedItem.originDay;
            if (originDay === targetDay) {
                setDragOverDay(null);
                return;
            }
            const dataFromOriginDay = schedule[originDay];
            const dataFromTargetDay = schedule[targetDay];
            if (dataFromTargetDay?.instructor) { // Swap
                newSchedule[originDay] = { instructor: dataFromTargetDay.instructor, studyMode: dataFromTargetDay.studyMode};
                newSchedule[targetDay] = { instructor: draggedItem.item, studyMode: dataFromOriginDay.studyMode};
            } else { // Move
                newSchedule[targetDay] = { instructor: draggedItem.item, studyMode: dataFromOriginDay.studyMode};
                if (originDay) newSchedule[originDay] = null;
            }
        }
        setSchedule(newSchedule);
        setDragOverDay(null);
    };
    
    const handleRemoveInstructorFromDay = (day) => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [day]: null,
        }));
    };

    const handleStudyModeChange = (day, newMode) => { setSchedule(prevSchedule => { if (prevSchedule[day]?.instructor) { return { ...prevSchedule, [day]: { ...prevSchedule[day], studyMode: newMode } }; } return prevSchedule; }); };
    
    const handleSaveSchedule = async () => {
        if (!session?.accessToken) {
            setError("Authentication session has expired. Please log in again.");
            return;
        }
        setIsSaving(true);
        setSaveStatus('saving');
        setSaveMessage('Saving schedule...');
        setErrorToast({ show: false, message: '' }); // Reset error toast

        const promises = [];
        const originalSchedule = JSON.parse(JSON.stringify(initialScheduleForCheck));

        Object.entries(schedule).forEach(([day, dayData]) => {
            const originalDayData = originalSchedule[day];
            const hasChanged = JSON.stringify(dayData) !== JSON.stringify(originalDayData);

            if (dayData && dayData.instructor && hasChanged) {
                const apiDay = clientDayToApiDay[day];
                if (apiDay) {
                    const payload = { classId: classData.id, instructorId: dayData.instructor.id, dayOfWeek: apiDay, online: dayData.studyMode === 'online', };
                    promises.push(classService.assignInstructorToClass(payload, session.accessToken));
                }
            }
        });

        Object.entries(initialScheduleForCheck).forEach(([day, dayData]) => {
            if (dayData && dayData.instructor && (!schedule[day] || !schedule[day].instructor)) {
                const apiDay = clientDayToApiDay[day];
                if (apiDay) {
                    const payload = { classId: classData.id, dayOfWeek: apiDay, };
                    promises.push(classService.unassignInstructorFromClass(payload, session.accessToken));
                }
            }
        });

        try {
            await Promise.all(promises);
            setSaveStatus('success');
            setSaveMessage('Schedule saved successfully!');
            setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
            // Success is handled by the main success popup, so no success toast needed here.
        } catch (error) {
            console.error('Failed to save schedule:', error);
            setSaveStatus('error');
            setSaveMessage(error.message || 'An error occurred while saving.');
            setErrorToast({ show: true, message: error.message || 'An error occurred while saving.' });
            
            // Revert schedule to original state on error
            setSchedule(originalSchedule);
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
        if (!schedulePanelElement) return;

        const scheduleIsEmpty = Object.values(schedule).every(dayData => !dayData || !dayData.instructor);
        if (scheduleIsEmpty) return;

        setIsPreparingPdf(true); 
        
        
        await new Promise(resolve => setTimeout(resolve, 50));

        const style = document.createElement('style');
        style.id = 'pdf-capture-styles';
       
        style.innerHTML = `
            /* Hide the static text by default */
            .pdf-only-text {
                display: none;
            }
            /* Add a class to the panel to scope these changes */
            .pdf-capture-mode .study-mode-select {
                display: none !important; /* Hide the interactive select dropdown */
            }
            .pdf-capture-mode .pdf-only-text {
                display: block !important; /* Show the static text version */
            }
            .pdf-capture-mode .group:hover { /* Disable hover effects */
                transform: none !important;
                box-shadow: inherit !important;
            }
            .pdf-capture-mode .group:hover .opacity-0 { /* Hide remove button on hover */
                opacity: 0 !important;
            }
            /* Hide the Save and Download buttons during capture */
            .pdf-capture-mode #saveScheduleButton,
            .pdf-capture-mode #downloadScheduleButton {
                display: none !important;
            }
        `;

        try {
           
            document.head.appendChild(style);
            schedulePanelElement.classList.add('pdf-capture-mode');

           
            await new Promise(resolve => setTimeout(resolve, 150));

           
            const canvas = await html2canvas(schedulePanelElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
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
            
            const copyrightText = '© Copyright ' + new Date().getFullYear() + ' NUM-FIT Digital Center. All rights reserved.';
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            pdf.text(copyrightText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

            pdf.save(`schedule_${classData.name.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            // ** CRUCIAL CLEANUP STEP **
            // This block guarantees the live page is always restored to its interactive state.
            document.getElementById('pdf-capture-styles')?.remove();
            schedulePanelElement.classList.remove('pdf-capture-mode');
            setIsPreparingPdf(false); 
        }
    };

    const saveButtonBaseClasses = "w-full sm:w-auto px-6 py-2 text-sm text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform active:scale-95";
    const downloadButtonBaseClasses = "w-full sm:w-auto px-6 py-2 text-sm text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out transform active:scale-95";
    const scheduleIsEmpty = Object.values(schedule).every(dayData => !dayData || !dayData.instructor);
    const saveButtonColorClasses = isSaving ? "bg-gray-400 opacity-60 cursor-not-allowed" : isDirty ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" : "bg-gray-400 opacity-80 cursor-not-allowed";
    const downloadButtonColorClasses = isSaving || isDirty || scheduleIsEmpty ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400";
    
    return (
        <div className='p-6 dark:text-white relative'> {/* Added 'relative' for overlay positioning */}
            {/* PDF Generation Overlay */}
            {isPreparingPdf && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
                        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Preparing Download...</span>
                    </div>
                </div>
            )}

            <ErrorToast
                show={errorToast.show}
                message={errorToast.message}
                onClose={() => setErrorToast({ ...errorToast, show: false })}
            />
            <SuccessPopup
                show={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Update Successful"
                message={successPopupMessage}
            />
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-1">Class Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
            <div className="class-section flex flex-col gap-6">
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-md text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("Class Name", "name", classData.name)}</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("Group", "group", classData.group)}{renderSelectField("Generation", "generation", classData.generation, generationOptions)}</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Faculty", "faculty", classData.faculty, departmentOptions, 'departmentId', 'name', 'name')}
                            {renderSelectField("Degree", "degrees", classData.degrees, degreesOptions)}
                            {renderSelectField("Major", "major", classData.major, majorOptions, 'departmentId', 'name', 'name')}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Semester", "semester", classData.semester, semesterOptions)}
                            {renderSelectField("Shift", "shift", classData.shift, shiftOptions, null, null, null)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderDateField("Publish Date", "publishDate", classData.publishDate)}
                            {renderSelectField("Status", "status", classData.status, statusOptions)}
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancelClick} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={handleSaveDetails} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Back</button>
                                    <button onClick={handleEditToggle} className="edit-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Edit Class</button>
                                </>
                            )}
                        </div>
                           {error && <p className="text-red-500 text-xs mt-2 text-right">{error}</p>}
                    </div>
                </div>
                <div className='flex-grow flex flex-col lg:flex-row gap-6 min-w-[300px]'>
                    <div className='h-[530px] lg:w-[250px] xl:w-[280px] flex-shrink-0 p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg self-start flex flex-col'>
                        <div> 
                            <h3 className="text-base sm:text-lg font-semibold mb-2 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Available Instructors</h3>
                            <div className="my-3 flex flex-col sm:flex-row items-center gap-2">
                                <input type="text" placeholder="Search by name..." className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                                <select value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)} className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500">
                                    {degreeFilterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3 flex-grow overflow-y-auto pr-1 min-h-[200px]">
                            {availableInstructors.length > 0 ? availableInstructors.map((instructor) => (
                                <div key={instructor.id} draggable onDragStart={(e) => handleNewInstructorDragStart(e, instructor)} onDragEnd={handleNewInstructorDragEnd} className="p-2 bg-sky-50 dark:bg-sky-700 dark:hover:bg-sky-600 border border-sky-200 dark:border-sky-600 rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group">
                                    {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0`} /> )}
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-sky-800 dark:text-sky-100 group-hover:text-sky-900 dark:group-hover:text-white">{instructor.name}</p>
                                        {instructor.degree && (<p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{instructor.degree}</p>)}
                                    </div>
                                </div>)) : 
                                (<p className="text-sm text-gray-500 dark:text-gray-400 italic">{searchTerm ? 'No matching instructors found.' : 'No instructors available.'}</p>)}
                        </div>
                    </div>
                    <div id="weeklySchedulePanel" className='flex-1 p-4 sm:p-6 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex flex-col'>
                        <h3 className="text-base sm:text-lg font-semibold mb-6 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Weekly Class Schedule - {classData.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-1">
                            {daysOfWeek.map((day) => {
                                const isDayWeekend = day === 'Sat' || day === 'Sun';
                                const isValidDropTarget = (isWeekendShift && isDayWeekend) || (!isWeekendShift && !isDayWeekend);

                                return (
                                    <div 
                                        key={day} 
                                        onDragOver={isValidDropTarget ? handleDayDragOver : null} 
                                        onDragEnter={isValidDropTarget ? (e) => handleDayDragEnter(e, day) : null} 
                                        onDragLeave={isValidDropTarget ? (e) => handleDayDragLeave(e, day) : null} 
                                        onDrop={isValidDropTarget ? (e) => handleDayDrop(e, day) : null}
                                        className={`p-1 rounded-lg min-h-[220px] flex flex-col justify-start group border-2 transition-all duration-200 ease-in-out 
                                            ${!isValidDropTarget 
                                                ? 'bg-gray-200 dark:bg-gray-900 cursor-not-allowed opacity-60' 
                                                : dragOverDay === day && draggedItem 
                                                    ? 'bg-emerald-50 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-500 ring-1 ring-emerald-300' 
                                                    : 'bg-gray-50 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                            }`
                                        }
                                    >
                                        <h4 className="text-sm sm:text-base text-center font-semibold text-gray-700 dark:text-gray-200 mb-3 select-none pt-1">{day}</h4>
                                        
                                        {!isValidDropTarget && (
                                            <div className="flex-grow flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic select-none px-2 text-center">
                                                Not available for this shift
                                            </div>
                                        )}

                                        {isValidDropTarget && (
                                            schedule[day]?.instructor ? (
                                                <ScheduledInstructorCard 
                                                    instructorData={schedule[day]} 
                                                    day={day} 
                                                    onDragStart={handleScheduledInstructorDragStart} 
                                                    onDragEnd={handleScheduledInstructorDragEnd} 
                                                    onRemove={handleRemoveInstructorFromDay} 
                                                    studyMode={schedule[day].studyMode} 
                                                    onStudyModeChange={handleStudyModeChange}
                                                />
                                            ) : (
                                                <div className="flex-grow flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic select-none px-2 text-center">
                                                    Drag instructor here
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
                                <ul className="list-disc text-xs mb-4 ml-3">
                                    <li>Generation: <span className="font-semibold text-num-dark-text dark:text-gray-100">{classData.generation}</span></li>
                                    <li>Group: <span className="font-semibold text-num-dark-text dark:text-gray-100">{classData.group}</span></li>
                                    <li>Semester: <span className="font-semibold text-num-dark-text dark:text-gray-100">{classData.semester}</span></li>
                                    <li>Shift: <span className="font-semibold text-num-dark-text dark:text-gray-100">{classData.shift}</span></li>
                                </ul>
                                <button id="saveScheduleButton" onClick={handleSaveSchedule} disabled={isSaving || !isDirty} className={`${saveButtonBaseClasses} ${saveButtonColorClasses}`}>
                                    {isSaving ? ( <span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</span>) : 'Save Schedule'}
                                </button>
                            </div>
                            <div className="flex flex-col items-end gap-1 w-full sm:w-auto mt-24">
                                <button id="downloadScheduleButton" onClick={handleDownloadSchedule} className={`${downloadButtonBaseClasses} ${downloadButtonColorClasses}`} disabled={isSaving || scheduleIsEmpty}>
                                    Download Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



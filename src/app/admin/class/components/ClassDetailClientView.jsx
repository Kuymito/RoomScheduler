// src/app/admin/class/components/ClassDetailClientView.jsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { classService } from '@/services/class.service';
import { useSession } from 'next-auth/react';
import Toast from '@/components/Toast';

const DefaultAvatarIcon = ({ className = "w-9 h-9" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const shiftMap = {
    'Morning Shift': 1,
    'Noon Shift': 2,
    'Afternoon Shift': 3,
    'Evening Shift': 4,
    'Weekend Shift': 5
};

// Data mapping for faculty, degree, and majors
const facultyMajorMap = {
    // Faculty of Management (ID: 1)
    1: {
        'Bachelor': ['Management', 'Marketing', 'Entrepreneurship'],
        'Master': ['Business Administration', 'Public Administration', 'Marketing', 'Logistics & Supply Chain Management', 'Management of Technology', 'Bank Management', 'Family Business Management']
    },
    // Faculty of Information Technology (ID: 2)
    2: {
        'Bachelor': ['Information Technology', 'Business Information Technology', 'Robotics Engineering', 'Computer Science']
    },
    // Faculty of Tourism (ID: 3)
    3: {
        'Bachelor': ['Tourism Management', 'Hospitality Management']
    },
    // Faculty of Law (ID: 4)
    4: {
        'Bachelor': ['Law'],
        'Master': ['Business Law']
    },
    // Faculty of Economics (ID: 5)
    5: {
        'Bachelor': ['Economics'],
        'Master': ['Economics']
    },
    // Faculty of Finance & Accounting (ID: 6)
    6: {
        'Bachelor': ['Finance and Banking', 'Accounting', 'Accounting and Taxation', 'Accounting and Auditing'],
        'Master': ['Finance']
    },
    // Faculty of Foreign Languages (ID: 7)
    7: {
        'Bachelor': ['Foreign Languages']
    }
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

const ScheduledInstructorCard = ({ instructorData, classDetails, day, onDragStart, onDragEnd, onRemove, studyMode, onStudyModeChange }) => {
    if (!instructorData || !instructorData.instructor) return null;
    const { instructor } = instructorData;
    const studyModes = [ { value: 'in-class', label: 'In Class' }, { value: 'online', label: 'Online' } ];
    const baseCardClasses = "w-full p-2 rounded-md shadow text-center flex flex-col items-center cursor-grab active:cursor-grabbing group relative transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border-2";
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
        <div className="w-full flex flex-col flex-grow">
            <div className="mb-5 w-full relative">
                <label htmlFor={`studyMode-${day}`} className="sr-only">Study Mode for {day}</label>
                <select
                    id={`studyMode-${day}`}
                    name={`studyMode-${day}`}
                    value={studyMode}
                    onChange={(e) => onStudyModeChange(day, e.target.value)}
                    className={`${baseSelectClasses} ${colorSelectClasses} w-full h-auto study-mode-select`}
                >
                    {studyModes.map(mode => (<option key={mode.value} value={mode.value}>{mode.label}</option>))}
                </select>
                <div className={`pdf-only-text hidden ${cardTextColorClasses} p-1.5 text-xs text-center font-medium`}>
                    {studyModes.find(m => m.value === studyMode)?.label}
                </div>
            </div>
            <div draggable onDragStart={(e) => onDragStart(e, instructor, day)} onDragEnd={onDragEnd} className={`${baseCardClasses} ${colorCardClasses} flex-grow`}>
                {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-400 mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; const sibling = e.currentTarget.nextSibling; if(sibling) sibling.style.display = 'flex'; }}/>) : null}
                {!instructor.profileImage && <DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0 flex items-center justify-center mb-1`} /> }
                <p className={`text-sm font-semibold truncate w-full scheduled-instructor-name ${cardTextColorClasses}`} title={instructor.name}>{instructor.name}</p>
                {instructor.degree && (<p className={`text-xs mt-0.5 ${cardTextColorClasses} opacity-80`}>{instructor.degree}</p>)}
                <button onClick={() => onRemove(day)} className="absolute top-1 right-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 p-1 bg-white/70 dark:bg-gray-900/70 rounded-full leading-none" title={`Remove ${instructor.name}`} aria-label={`Remove ${instructor.name}`}>✕</button>
            </div>
        </div>
    );
};

export default function ClassDetailClientView({ initialClassDetails, allInstructors, allDepartments, allMajors, initialSchedule, allClasses, allSchedules }) {
    const router = useRouter();
    const { data: session } = useSession();
    
    const [classData, setClassData] = useState(initialClassDetails);
    const [backupData, setBackupData] = useState(null); 

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    
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
    const [selectedDegree, setSelectedDegree] = useState('All');
    
  
    const [isPreparingPdf, setIsPreparingPdf] = useState(false);
    const [filteredMajors, setFilteredMajors] = useState([]);

    const generationOptions = useMemo(() => {
        const BASE_YEAR = 2025;
        const BASE_GENERATION = 34;
        const currentYear = new Date().getFullYear();
        const yearDifference = currentYear - BASE_YEAR;
        const currentFirstYearGeneration = BASE_GENERATION + yearDifference;
        const options = [];
        for (let i = 0; i < 4; i++) {
            options.push(String(currentFirstYearGeneration - i));
        }
        return options.sort((a, b) => Number(a) - Number(b));
    }, []);

    const degreesOptions = ['Bachelor', 'Master', 'PhD'];
    const shiftOptions = Object.keys(shiftMap);
    const departmentOptions = useMemo(() => allDepartments || [], [allDepartments]);
    const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
    const statusOptions = ['Active', 'Archived'];

    const degreeFilterOptions = ['All', ...degreesOptions];

    const isWeekendShift = classData.shift?.includes('Weekend');

    const availableInstructors = useMemo(() => {
        if (!allInstructors || !Array.isArray(allInstructors)) return [];
        const assignedInstructorIds = new Set(Object.values(schedule).filter(day => day?.instructor).map(day => day.instructor.id));
        
        let filtered = allInstructors.filter(instructor => 
            !assignedInstructorIds.has(instructor.id) && !instructor.archived
        );

        if (selectedDegree !== 'All') {
            filtered = filtered.filter(instructor => instructor.degree === selectedDegree);
        }
        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(instructor =>
                instructor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (instructor.degree && instructor.degree.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        return filtered;
    }, [schedule, searchTerm, allInstructors, selectedDegree]);

    const roomScheduleMap = useMemo(() => {
        if (!allSchedules) return {};
        const map = {};
        const shiftNameMap = {
            '07:00:00': 'Morning Shift', '10:30:00': 'Noon Shift', '14:00:00': 'Afternoon Shift',
            '17:30:00': 'Evening Shift', '07:30:00': 'Weekend Shift'
        };
        const dayApiToClientMap = {
            MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thur',
            FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
        };

        allSchedules.forEach(schedule => {
            if (!schedule?.dayDetails || !schedule.shift?.startTime) return;

            const timeSlot = shiftNameMap[schedule.shift.startTime];
            if (!timeSlot) return;

            schedule.dayDetails.forEach(dayDetail => {
                const day = dayApiToClientMap[dayDetail.dayOfWeek.toUpperCase()];
                if (day) {
                    if (!map[day]) map[day] = {};
                    if (!map[day][timeSlot]) map[day][timeSlot] = {};
                    
                    const roomId = schedule.temporaryRoomId || schedule.roomId;
                    if (roomId && !dayDetail.online) {
                        map[day][timeSlot][roomId] = {
                            classId: schedule.classId,
                            className: schedule.className
                        };
                    }
                }
            });
        });
        return map;
    }, [allSchedules]);

    const currentClassPermanentRoomId = useMemo(() => {
        if (!allSchedules || !classData?.id) return null;
        const permanentRoomCounts = {};
        allSchedules.forEach(s => {
            if (s.classId === classData.id && s.roomId && !s.temporaryRoomId) {
                if (!permanentRoomCounts[s.roomId]) {
                    permanentRoomCounts[s.roomId] = 0;
                }
                permanentRoomCounts[s.roomId]++;
            }
        });
        const roomIds = Object.keys(permanentRoomCounts);
        if (roomIds.length === 0) return null;
        // Return the room ID with the highest count
        return roomIds.reduce((a, b) => permanentRoomCounts[a] > permanentRoomCounts[b] ? a : b);
    }, [allSchedules, classData.id]);

    useEffect(() => {
        if (!isEditing || !classData || isNameManuallySet) return;
        setClassData(prev => ({ ...prev, name: `NUM${prev.generation}-${prev.group}` }));
    }, [isEditing, isNameManuallySet, classData?.generation, classData?.group]);
    
    useEffect(() => {
        setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
    }, []);

    useEffect(() => {
        if (initialScheduleForCheck) setIsDirty(JSON.stringify(schedule) !== JSON.stringify(initialScheduleForCheck));
        else setIsDirty(false);
    }, [schedule, initialScheduleForCheck]);

    useEffect(() => {
        if (allMajors && classData.faculty && classData.degrees) {
            const selectedDepartment = allDepartments.find(d => d.name === classData.faculty);
            if (!selectedDepartment) {
                setFilteredMajors([]);
                return;
            }
            const departmentId = selectedDepartment.departmentId;
            const allowedMajorNames = facultyMajorMap[departmentId]?.[classData.degrees] || [];
            const majorsForDepartmentAndDegree = allMajors.filter(major => 
                allowedMajorNames.includes(major.majorName)
            );
            setFilteredMajors(majorsForDepartmentAndDegree);
            if (isEditing && !majorsForDepartmentAndDegree.some(m => m.majorName === classData.major)) {
                setClassData(prev => ({ ...prev, major: majorsForDepartmentAndDegree[0]?.majorName || '' }));
            }
        }
    }, [classData.faculty, classData.degrees, allMajors, allDepartments, isEditing, classData.major]);

    const handleEditToggle = () => {
        if (!isEditing) {
            setBackupData(JSON.parse(JSON.stringify(classData)));
            const expectedName = `NUM${classData.generation}-${classData.group}`;
            setIsNameManuallySet(classData.name !== expectedName && classData.name !== '');
            setIsEditing(true);
            setToast({ show: false, message: '', type: 'info' });
        }
    };
    
    const handleCancelClick = () => {
        if (backupData) setClassData(backupData);
        setIsEditing(false);
        setBackupData(null); 
        setToast({ show: false, message: '', type: 'info' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'name') {
            const hyphenCount = (value.match(/-/g) || []).length;
            const numberCount = (value.match(/\d/g) || []).length;
            
            if (/^[A-Za-z0-9-\s]*$/.test(value) && hyphenCount <= 1 && numberCount <= 3) {
                setIsNameManuallySet(value !== '');
                setClassData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'group') {
            if (/^\d{0,3}$/.test(value)) {
                setClassData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setClassData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveDetails = async () => {
        setLoading(true);
        setToast({ show: false, message: '', type: 'info' });

        if (classData.name && !classData.name.trim()) {
            setToast({
                show: true,
                message: 'Class Name cannot contain only spaces.',
                type: 'error'
            });
            setLoading(false);
            return;
        }

        if (allClasses && Array.isArray(allClasses)) {
            const newGroupNumber = parseInt(classData.group, 10);
            const isDuplicate = allClasses.some(
                (cls) =>
                    cls.classId !== classData.id &&
                    String(cls.generation) === String(classData.generation) &&
                    parseInt(cls.groupName, 10) === newGroupNumber
            );

            if (isDuplicate) {
                setToast({
                    show: true,
                    message: `A class with Generation ${classData.generation} and Group ${classData.group} already exists.`,
                    type: 'error'
                });
                setLoading(false);
                return;
            }
        }

        if (!session?.accessToken) {
            setToast({ show: true, message: "You are not authenticated.", type: 'error' });
            setLoading(false);
            return;
        }

        const selectedDepartment = allDepartments.find(dep => dep.name === classData.faculty);
        if (!selectedDepartment) {
            setToast({ show: true, message: "Invalid faculty selected.", type: 'error' });
            setLoading(false);
            return;
        }
        
        const shiftIdValue = shiftMap[classData.shift];
        
        if (!shiftIdValue) {
            setToast({ show: true, message: "Invalid shift selected.", type: 'error' });
            setLoading(false);
            return;
        }

        const finalClassName = classData.name.trim() || `NUM${classData.generation}-${classData.group}`;

        const apiPayload = {
            className: finalClassName,
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
            setToast({ show: true, message: "Class details have been updated successfully.", type: 'success' });
            setIsEditing(false);
            setBackupData(null);
            setClassData(prev => ({ ...prev, name: finalClassName }));
        } catch (err) {
            setToast({ show: true, message: err.message || "Failed to update class.", type: 'error' });
            if (backupData) setClassData(backupData);
        } finally {
            setLoading(false);
        }
    };
    
    const renderSelectField = (label, name, value, options, keyField, valueField, labelField) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {options.map(option => {
                        const optionKey = keyField ? option[keyField] : (typeof option === 'object' ? JSON.stringify(option) : option);
                        const optionValue = valueField ? option[valueField] : option;
                        const optionLabel = labelField ? option[labelField] : option;
                        return <option key={optionKey} value={optionValue}>{optionLabel}</option>;
                    })}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            )}
        </div>
    );

    const renderMajorSelectField = () => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Major</label>
            {isEditing ? (
                <select name="major" value={classData.major} onChange={handleInputChange} disabled={loading || filteredMajors.length === 0} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {filteredMajors.length > 0 ? (
                        filteredMajors.map(major => (
                            <option key={major.major_id} value={major.majorName}>{major.majorName}</option>
                        ))
                    ) : (
                        <option value="" disabled>No majors available</option>
                    )}
                </select>
            ) : (
                <input type="text" value={classData.major} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            )}
        </div>
    );
    
    const renderTextField = (label, name, value, opts = {}) => (
         <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <input type="text" name={name} value={value || ''} onChange={handleInputChange} readOnly={!isEditing} disabled={loading} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white focus:ring-blue-500 focus:outline-none focus:ring-2 ${!isEditing ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`} maxLength={opts.maxLength} />
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
        setDraggedItem(null); setDragOverDay(null);
    };

    const handleDayDragOver = (e) => { e.preventDefault(); if (draggedItem) e.dataTransfer.dropEffect = 'move'; };
    const handleDayDragEnter = (e, day) => { e.preventDefault(); if (draggedItem) setDragOverDay(day); };
    const handleDayDragLeave = (e, day) => { if (e.currentTarget.contains(e.relatedTarget)) return; if (dragOverDay === day) setDragOverDay(null); };
    
    // MODIFIED: This function now ONLY handles local state changes. No API calls.
    const handleDayDrop = (e, targetDay) => {
        e.preventDefault();
        if (!draggedItem) return;

        const isTargetWeekend = targetDay === 'Sat' || targetDay === 'Sun';
        if ((isWeekendShift && !isTargetWeekend) || (!isWeekendShift && isTargetWeekend)) {
            setDragOverDay(null);
            return;
        }
    
        const { item: draggedInstructor, type: draggedType, originDay } = draggedItem;
        
        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            const targetDayData = prevSchedule[targetDay];

            if (draggedType === 'new') {
                // This covers both assigning to an empty slot and replacing an existing one in the UI.
                // The save logic will figure out whether to call assign or replace.
                newSchedule[targetDay] = {
                    instructor: draggedInstructor,
                    studyMode: targetDayData?.studyMode || 'in-class', // Preserve study mode if replacing
                };
            } else if (draggedType === 'scheduled') {
                if (originDay === targetDay) return prevSchedule; // No change if dropped on itself

                const originDayData = prevSchedule[originDay];
                
                // This covers both moving to an empty slot and swapping with an existing instructor.
                newSchedule[targetDay] = originDayData;
                newSchedule[originDay] = targetDayData; // If target was null, origin becomes null.
            }
            return newSchedule;
        });

        setDragOverDay(null);
        setDraggedItem(null);
    };
    
    const handleRemoveInstructorFromDay = (day) => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [day]: null,
        }));
    };

    const handleStudyModeChange = (day, newMode) => { setSchedule(prevSchedule => { if (prevSchedule[day]?.instructor) { return { ...prevSchedule, [day]: { ...prevSchedule[day], studyMode: newMode } }; } return prevSchedule; }); };
    
    // MODIFIED: This function now correctly determines which API to call based on state changes.
    const handleSaveSchedule = async () => {
        if (!session?.accessToken) {
            setToast({ show: true, message: "Authentication session has expired. Please log in again.", type: 'error' });
            return;
        }
        setIsSaving(true);
        setToast({ show: false, message: '', type: 'info' }); 

        const promises = [];
        const originalSchedule = JSON.parse(JSON.stringify(initialScheduleForCheck));
        const processedSwaps = new Set(); // To avoid creating duplicate swap promises

        daysOfWeek.forEach(dayA => {
            if (processedSwaps.has(dayA)) return;

            const apiDayA = clientDayToApiDay[dayA];
            if (!apiDayA) return;

            const originalA = originalSchedule[dayA];
            const currentA = schedule[dayA];

            if (JSON.stringify(originalA) === JSON.stringify(currentA)) {
                return;
            }

            // Check for a SWAP
            // A swap occurs if the instructor at dayA is now at dayB, and the instructor from dayB is now at dayA.
            let swapFound = false;
            if (originalA?.instructor && currentA?.instructor) {
                for (const dayB of daysOfWeek) {
                    if (dayA === dayB || processedSwaps.has(dayB)) continue;
                    
                    const originalB = originalSchedule[dayB];
                    const currentB = schedule[dayB];

                    if (originalB?.instructor && currentB?.instructor &&
                        originalA.instructor.id === currentB.instructor.id &&
                        originalB.instructor.id === currentA.instructor.id) {
                        
                        const payload = { classId: classData.id, fromDayOfWeek: apiDayA, toDayOfWeek: clientDayToApiDay[dayB] };
                        promises.push(classService.swapInstructorsInClass(payload, session.accessToken));
                        
                        processedSwaps.add(dayA);
                        processedSwaps.add(dayB);
                        swapFound = true;

                        // After a swap, check if study modes also changed independently
                        if (originalA.studyMode !== currentA.studyMode) {
                             const assignPayload = { classId: classData.id, instructorId: currentA.instructor.id, dayOfWeek: apiDayA, online: currentA.studyMode === 'online' };
                             promises.push(classService.assignInstructorToClass(assignPayload, session.accessToken));
                        }
                         if (originalB.studyMode !== currentB.studyMode) {
                            const assignPayload = { classId: classData.id, instructorId: currentB.instructor.id, dayOfWeek: clientDayToApiDay[dayB], online: currentB.studyMode === 'online' };
                            promises.push(classService.assignInstructorToClass(assignPayload, session.accessToken));
                        }
                        break;
                    }
                }
            }
            
            if (swapFound) return;

            // If not a swap, handle Assign, Unassign, Replace, or Modify
            if (!originalA && currentA?.instructor) { // ASSIGN
                const payload = { classId: classData.id, instructorId: currentA.instructor.id, dayOfWeek: apiDayA, online: currentA.studyMode === 'online' };
                promises.push(classService.assignInstructorToClass(payload, session.accessToken));
            } else if (originalA?.instructor && !currentA) { // UNASSIGN
                const payload = { classId: classData.id, dayOfWeek: apiDayA };
                promises.push(classService.unassignInstructorFromClass(payload, session.accessToken));
            } else if (originalA?.instructor && currentA?.instructor) { // MODIFY
                if (originalA.instructor.id !== currentA.instructor.id) { // REPLACE
                    const payload = { classId: classData.id, dayOfWeek: apiDayA, newInstructorId: currentA.instructor.id };
                    promises.push(classService.replaceInstructorInClass(payload, session.accessToken));
                }
                if (originalA.studyMode !== currentA.studyMode) { // STUDY MODE CHANGE
                    const payload = { classId: classData.id, instructorId: currentA.instructor.id, dayOfWeek: apiDayA, online: currentA.studyMode === 'online' };
                    promises.push(classService.assignInstructorToClass(payload, session.accessToken));
                }
            }
        });

        try {
            await Promise.all(promises);
            setToast({ show: true, message: 'Schedule saved successfully!', type: 'success' });
            setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule)));
            if (typeof window !== 'undefined') {
                const channel = new BroadcastChannel('data_update_channel');
                channel.postMessage({ type: 'DATA_UPDATED' });
                channel.close();
            }
        } catch (error) {
            console.error('Failed to save schedule:', error);
            setToast({ show: true, message: error.message || 'An error occurred while saving.', type: 'error' });
            setSchedule(originalSchedule);
        } finally {
            setIsSaving(false);
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
            .pdf-capture-mode .study-mode-select {
                display: none !important;
            }
            .pdf-capture-mode .pdf-only-text {
                display: block !important;
            }
            .pdf-capture-mode .group:hover {
                transform: none !important;
                box-shadow: inherit !important;
            }
            .pdf-capture-mode .group:hover .opacity-0 {
                opacity: 0 !important;
            }
            .pdf-capture-mode #saveScheduleButton,
            .pdf-capture-mode #downloadScheduleButton {
                display: none !important;
            }
            .pdf-capture-mode .scheduled-instructor-name,
            .pdf-capture-mode .schedule-title-for-pdf {
                white-space: normal !important;
                overflow-wrap: break-word !important;
                word-break: break-word !important;
                overflow: visible !important;
                text-overflow: clip !important;
                max-width: none !important;
            }
        `;

        const titleElement = schedulePanelElement.querySelector('.schedule-title-for-pdf');
        const originalTitleHTML = titleElement ? titleElement.innerHTML : '';
        if (titleElement) {
            const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            titleElement.innerHTML = `
                <div style="line-height: 1.2;">
                    Class Schedule: ${classData.name}
                    <br>
                    <span style="font-size: 0.8em; color: #6b7280; font-weight: normal; padding-top: 0.5em;">Date: ${currentDate}</span>
                </div>`;
        }


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
            if (titleElement) {
                titleElement.innerHTML = originalTitleHTML;
            }
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
        <div className='p-6 dark:text-white relative'>
            {isPreparingPdf && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
                        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Preparing Download...</span>
                    </div>
                </div>
            )}

            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-1">Class Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
            <div className="class-section flex flex-col gap-6">
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-md text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">{renderTextField("Class Name", "name", classData.name, { maxLength: 30 })}</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Group", "group", classData.group, { maxLength: 3 })}
                            {renderSelectField("Generation", "generation", classData.generation, generationOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Faculty", "faculty", classData.faculty, allDepartments, 'departmentId', 'name', 'name')}
                            {renderSelectField("Degree", "degrees", classData.degrees, degreesOptions)}
                            {renderMajorSelectField()}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Semester", "semester", classData.semester, semesterOptions)}
                            {renderSelectField("Shift", "shift", classData.shift, shiftOptions, null, null, null)}
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
                    </div>
                </div>
                <div className='flex-grow flex flex-col lg:flex-row gap-6 min-w-[300px]'>
                    <div className='h-[530px] lg:w-[250px] xl:w-[280px] flex-shrink-0 p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg self-start flex flex-col'>
                        <div> 
                            <h3 className="text-base sm:text-lg font-semibold mb-2 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Available Instructors</h3>
                            <div className="my-3 flex flex-col sm:flex-row items-center gap-2">
                                <input type="text" placeholder="Search by name..." className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-offset-gray-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                                <select value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)} className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    {degreeFilterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3 flex-grow overflow-y-auto pr-1 min-h-[200px]">
                            {availableInstructors.length > 0 ? availableInstructors.map((instructor) => (
                                <div key={instructor.id} draggable onDragStart={(e) => handleNewInstructorDragStart(e, instructor)} onDragEnd={handleNewInstructorDragEnd} className="p-2 bg-sky-50 dark:bg-sky-700 dark:hover:bg-sky-600 border border-sky-200 dark:border-sky-600 rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 group">
                                    {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0`} /> )}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-sky-800 dark:text-sky-100 group-hover:text-sky-900 dark:group-hover:text-white truncate" title={instructor.name}>{instructor.name}</p>
                                        {instructor.degree && (<p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{instructor.degree}</p>)}
                                    </div>
                                </div>)) : 
                                (<p className="text-sm text-gray-500 dark:text-gray-400 italic">{searchTerm ? 'No matching instructors found.' : 'No instructors available.'}</p>)}
                        </div>
                    </div>
                    <div id="weeklySchedulePanel" className='flex-1 p-4 sm:p-6 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex flex-col'>
                        <h3 className="schedule-title-for-pdf md:max-w-[500px] max-w-[350px] text-base sm:text-lg font-semibold mb-6 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-4 truncate" title={classData.name}>Weekly Class Schedule - {classData.name}</h3>
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
                                                    classDetails={classData}
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
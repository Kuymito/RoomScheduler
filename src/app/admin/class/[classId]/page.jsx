'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- API Base URL --- 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- API Helper Functions ---
const fetchClassDetailsAPI = async (classId) => {
    const response = await fetch(`${API_BASE_URL}/class/${classId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch class details. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch class details. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
    if (apiResponse.status !== 'OK' && apiResponse.status !== 200) {
        throw new Error(apiResponse.message || 'API returned an error fetching class details');
    }
    return apiResponse.payload; // Assuming payload is the ClassResponseDto
};

const fetchInstructorsAPI = async () => {
    const response = await fetch(`${API_BASE_URL}/instructors?isArchived=false`); // Fetch active instructors
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch instructors. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch instructors. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
     if (apiResponse.status !== 'OK' && apiResponse.status !== 200) {
        throw new Error(apiResponse.message || 'API returned an error fetching instructors');
    }
    return apiResponse.payload; // Assuming payload is List<InstructorResponseDto>
};

const updateClassDetailsAPI = async (classId, classUpdateDto) => {
    const response = await fetch(`${API_BASE_URL}/class/${classId}`, { // Assuming PUT updates all, or PATCH for partial
        method: 'PATCH', // or 'PATCH' if using ClassUpdateDto for partial updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classUpdateDto),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to update class. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to update class. Status: ${response.status}`);
    }
    const apiResponse = await response.json();
    if (apiResponse.status !== 'OK' && apiResponse.status !== 200) {
        throw new Error(apiResponse.message || 'API returned an error on update');
    }
    return apiResponse.payload;
};

// TODO: Define API function for saving/fetching the weekly schedule for a class
// const saveClassScheduleAPI = async (classId, schedulePayload) => { ... };
// const fetchClassScheduleAPI = async (classId) => { ... };

    
// --- DefaultAvatarIcon Component ---
const DefaultAvatarIcon = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-500 dark:text-gray-400 border border-gray-300 rounded-full p-1 dark:border-gray-600`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

// --- Options for Dropdown Menus (Can be dynamic from API later) ---
const generationOptions = ['Gen10', '2024', '2025', '30', '31', '32', '33', '34', '35']; // Expanded
const majorOptions = ['IT', 'Computer Science', 'Information Systems', 'Software Engineering', 'AI', 'Data Science', 'Machine Learning', 'Digital Arts']; // Expanded
const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
// facultyOptions should ideally come from a Department API or be derived
// For now, make it more generic or ensure it matches department names from your API
const facultyOptions = ['Faculty of IT', 'Faculty of CS', 'Faculty of IS', 'Faculty of AI & Robotics', 'Faculty of Digital Arts', 'Faculty of Business'];
const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', '2024-2025 S1', '2024-2025 S2', '2024-2025 S3']; // Expanded
// shiftOptions can be dynamic from your Shifts API
const shiftOptions = ['7:00-10:00', '10:30-13:30', '14:00-17:00', '17:30-20:30', '8:00 - 11:00', '9:00 - 12:00', '13:00 - 16:00', '15:00 - 18:00']; // Expanded
const statusOptions = ['Active', 'Archived']; // Frontend display
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
const studyModes = [
    { value: 'in-class', label: 'In Class' },
    { value: 'online', label: 'Online' },
];

// --- Skeleton Loader ---
const ClassDetailSkeleton = () => { /* ... (Skeleton remains the same) ... */ 
    const SkeletonFormField = () => (
    <div className="flex-1 min-w-[200px] space-y-2">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3"></div>
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
    </div>
    );

    return (
    <div className='p-6 animate-pulse'>
        <div className="h-7 w-32 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
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
        {/* Add skeleton for scheduler part too */}
    </div>
    );
};

const EditIcon = ({ className = "w-[14px] h-[14px]" }) => (
        <svg className={className} width="14" height="14" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

// --- Draggable Scheduled Item Component ---
const ScheduledInstructorCard = ({ instructorData, day, onDragStart, onDragEnd, onRemove, studyMode, onStudyModeChange }) => {
    if (!instructorData || !instructorData.instructor) return null;
    const { instructor } = instructorData; // instructor is { id, name, profileImage, degree }
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
    } else { 
        colorCardClasses = "bg-sky-100 dark:bg-sky-700 border-sky-500 dark:border-sky-700";
        cardTextColorClasses = "text-sky-800 dark:text-sky-50";
        colorSelectClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500";
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="mb-3 w-full">
                <label htmlFor={`studyMode-${day}-${instructor.id}`} className="sr-only">Study Mode for {instructor.name} on {day}</label>
                <select id={`studyMode-${day}-${instructor.id}`} name={`studyMode-${day}-${instructor.id}`} value={studyMode} onChange={(e) => onStudyModeChange(day, e.target.value)} className={`${baseSelectClasses} ${colorSelectClasses}`}>
                    {studyModes.map(mode => (<option key={mode.value} value={mode.value}>{mode.label}</option>))}
                </select>
            </div>
            <div draggable onDragStart={(e) => onDragStart(e, instructor, day)} onDragEnd={onDragEnd} className={`${baseCardClasses} ${colorCardClasses}`}>
                {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-400 mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; /* Optionally show DefaultAvatarIcon here */ }}/>) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0 flex items-center justify-center mb-1`} />)}
                <p className={`text-sm font-semibold break-words ${cardTextColorClasses}`}>{instructor.name}</p>
                {instructor.degree && (<p className={`text-xs mt-0.5 ${cardTextColorClasses} opacity-80`}>{instructor.degree}</p>)}
                <button onClick={() => onRemove(day)} className="absolute top-1 right-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 p-1 bg-white/70 dark:bg-gray-900/70 rounded-full leading-none" title={`Remove ${instructor.name}`} aria-label={`Remove ${instructor.name}`}>&#x2715;</button>
            </div>
        </div>
    );
};


const ClassDetailsContent = () => {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId ? parseInt(params.classId, 10) : null;

    // State for general class details
    const [classDetails, setClassDetails] = useState(null); // Stores API response structure
    const [editableClassDetails, setEditableClassDetails] = useState(null); // For form editing
    
    // State for instructors list
    const [allInstructors, setAllInstructors] = useState([]); // Stores InstructorResponseDto from API

    // State for the weekly schedule
    const clientInitialSchedule = useMemo(() => daysOfWeek.reduce((acc, day) => { acc[day] = null; return acc; }, {}), []);
    const [schedule, setSchedule] = useState(clientInitialSchedule);
    const [initialScheduleForCheck, setInitialScheduleForCheck] = useState(null); // For dirty check

    const [allDepartments, setAllDepartments] = useState([]);
    const [allShifts, setAllShifts] = useState([]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);
    const [isDirty, setIsDirty] = useState(false); // For schedule changes
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // For instructor search
    const [isSaving, setIsSaving] = useState(false); // For general details save
    const [isSavingSchedule, setIsSavingSchedule] = useState(false); // For schedule save
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error'
    const [saveMessage, setSaveMessage] = useState('');
    
    const saveStatusRef = useRef(saveStatus);
    useEffect(() => { saveStatusRef.current = saveStatus; }, [saveStatus]);

    const fetchDepartmentsAPI = async () => {
        const response = await fetch(`${API_BASE_URL}/department`); // Assuming this endpoint exists
        if (!response.ok) throw new Error('Failed to fetch departments');
        const apiResponse = await response.json();
        return apiResponse.payload; // Expects [{ departmentId: 1, name: "Faculty of CS" }]
    };

    const fetchShiftsAPI = async () => {
        const response = await fetch(`${API_BASE_URL}/shift`); // Assuming this endpoint exists
        if (!response.ok) throw new Error('Failed to fetch shifts');
        const apiResponse = await response.json();
        return apiResponse.payload; // Expects [{ shiftId: 1, name: "Morning", ... }]
    };


    // Transform API ClassResponseDto to the structure needed by the form/display
    // --- Data Mapping (API Response -> Frontend State) ---
    const transformApiClassToEditable = useCallback((apiClass) => {
        if (!apiClass) return null;
        return {
            id: apiClass.classId,
            name: apiClass.className,
            generation: apiClass.generation,
            group: apiClass.groupName,
            // Store the full objects for related entities
            department: apiClass.department, // { departmentId: 1, name: "Faculty of CS" }
            shift: apiClass.shift,           // { shiftId: 1, name: "Morning", ... }
            // For simple string fields:
            major: apiClass.majorName,
            degrees: apiClass.degreeName,
            semester: apiClass.semester,
            status: apiClass.archived ? 'Archived' : 'Active',
            isOnline: apiClass.online,
        };
    }, []);

// --- Data Mapping (Frontend State -> API Update DTO for PATCH/PUT) ---
const transformEditableToApiUpdateDto = useCallback((editableData) => {
    return {
        className: editableData.name,
        generation: editableData.generation,
        groupName: editableData.group,
        majorName: editableData.major,
        degreeName: editableData.degrees,
        semester: editableData.semester,
        isOnline: editableData.isOnline,
        
        // ✅ Now we can reliably send the correct IDs
        departmentId: editableData.department?.departmentId,
        shiftId: editableData.shift?.shiftId,
    };
}, []);
    
    // Transform API InstructorResponseDto to the structure needed by instructor list/cards
    const transformApiInstructorToFrontend = (apiInstructor) => {
        if (!apiInstructor) return null;
        return {
            id: apiInstructor.instructorId, // Ensure your draggable card uses 'id'
            name: `${apiInstructor.firstName} ${apiInstructor.lastName}`,
            profileImage: apiInstructor.profile, // Or a specific image URL field if available
            degree: apiInstructor.degree,
            // other fields if needed by ScheduledInstructorCard
        };
    };


    useEffect(() => {
        if (!classId) { /* ... */ return; }
        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch everything in parallel
                const [classApiData, instructorsApiData, departmentsData, shiftsData] = await Promise.all([
                    fetchClassDetailsAPI(classId),
                    fetchInstructorsAPI(),
                    fetchDepartmentsAPI(), // Fetch all departments
                    fetchShiftsAPI(),      // Fetch all shifts
                    // fetchClassScheduleAPI(classId) // If you have this
                ]);

                setAllInstructors(instructorsApiData.map(transformApiInstructorToFrontend));
                setAllDepartments(departmentsData);
                setAllShifts(shiftsData);
                
                const transformedClass = transformApiClassToEditable(classApiData);
                setClassDetails(transformedClass);
                setEditableClassDetails(JSON.parse(JSON.stringify(transformedClass)));
                // ... (rest of schedule logic) ...
            } catch (err) {
                console.error("Failed to load page data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [classId, transformApiClassToEditable]); // Removed clientInitialSchedule from deps as it's constant

    const currentData = isEditing ? editableClassDetails : classDetails;

    const handleEditToggle = async () => {
        if (isEditing) { // Trying to save
            if (!editableClassDetails) return;
            setIsSaving(true);
            setError(null);
            setSaveMessage("Saving class details...");
            setSaveStatus("saving");
            try {
                const updateDto = transformEditableToApiUpdateDto(editableClassDetails);
                // TODO: Your updateDto needs to align with what backend expects.
                // Currently, it's missing fields like facultyName, semester.
                // And shift/department/instructor are by ID usually.
                // For now, I'll assume updateClassDetailsAPI takes the DTO as is.
                // You might need to modify updateDto to include only fields that can be updated
                // and that exist in your backend DTO (e.g. ClassUpdateDto or ClassCreateDto if PUT).

                const updatedApiClass = await updateClassDetailsAPI(classId, updateDto);
                const transformedUpdatedClass = transformApiClassToEditable(updatedApiClass);
                setClassDetails(transformedUpdatedClass);
                setEditableClassDetails(JSON.parse(JSON.stringify(transformedUpdatedClass)));
                setIsEditing(false);
                setSaveMessage("Class details updated successfully!");
                setSaveStatus("success");
            } catch (err) {
                console.error("Failed to save class details:", err);
                setError(err.message || "Failed to save details.");
                setSaveMessage(err.message || "Failed to save details.");
                setSaveStatus("error");
            } finally {
                setIsSaving(false);
                setTimeout(() => {
                    if (saveStatusRef.current !== 'saving') {setSaveMessage(''); setSaveStatus('');}
                }, 3000);
            }
        } else { // Switching to edit mode
            if (!classDetails) return;
            setEditableClassDetails(JSON.parse(JSON.stringify(classDetails))); // Deep copy
            const expectedName = `NUM${classDetails.generation}-${classDetails.group}`;
            setIsNameManuallySet(classDetails.name !== expectedName);
            setIsEditing(true);
            setError(null);
            setSaveMessage('');
            setSaveStatus('');
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        if (classDetails) {
            setEditableClassDetails(JSON.parse(JSON.stringify(classDetails))); // Reset to original fetched details
        }
        setIsNameManuallySet(false); // Reset this flag too
        setError(null);
        setSaveMessage('');
        setSaveStatus('');
    };
    
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        setEditableClassDetails(prev => {
            const newDetails = { ...prev };
            
            // For dropdowns that depend on fetching full objects
            if (name === 'department') {
                const selectedDept = allDepartments.find(d => d.departmentId === parseInt(value, 10));
                newDetails.department = selectedDept || null;
            } else if (name === 'shift') {
                const selectedShift = allShifts.find(s => s.shiftId === parseInt(value, 10));
                newDetails.shift = selectedShift || null;
            } else {
                // For regular text inputs
                newDetails[name] = value;
            }
            return newDetails;
        });

        if (name === 'name') {
            setIsNameManuallySet(value !== '');
        }
    };

    useEffect(() => {
        if (isEditing && editableClassDetails && !isNameManuallySet && editableClassDetails.generation && editableClassDetails.group) {
            setEditableClassDetails(prev => ({
                ...prev,
                name: `NUM${prev.generation}-${prev.group}`
            }));
        }
    }, [editableClassDetails?.generation, editableClassDetails?.group, isEditing, isNameManuallySet]);


    const availableInstructors = useMemo(() => {
        const assignedInstructorIds = new Set(
            Object.values(schedule)
                  .filter(daySchedule => daySchedule && daySchedule.instructor)
                  .map(daySchedule => daySchedule.instructor.id)
        );
        
        let filtered = allInstructors.filter(instructor => !assignedInstructorIds.has(instructor.id));
        
        if (searchTerm.trim() !== '') {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(instructor =>
                instructor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (instructor.degree && instructor.degree.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        return filtered;
    }, [schedule, allInstructors, searchTerm]);

    // --- Drag and Drop Handlers --- (Mostly unchanged, ensure instructor object structure matches)
    const handleNewInstructorDragStart = (e, instructor) => {
        setDraggedItem({ item: instructor, type: 'new' }); // instructor here is {id, name, profileImage, degree}
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(instructor));
        e.currentTarget.classList.add('opacity-60', 'scale-95');
    };
    const handleNewInstructorDragEnd = (e) => {
        if (draggedItem?.type === 'new') { setDraggedItem(null); }
        e.currentTarget.classList.remove('opacity-60', 'scale-95');
        setDragOverDay(null);
    };
    const handleScheduledInstructorDragStart = (e, instructorData, originDay) => { // instructorData is { instructor: {...}, studyMode: '...' }
        setDraggedItem({ item: instructorData.instructor, type: 'scheduled', originDay: originDay, studyMode: instructorData.studyMode });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ ...instructorData.instructor, originDay, studyMode: instructorData.studyMode }));
    };
    const handleScheduledInstructorDragEnd = (e) => {
        if (draggedItem?.type === 'scheduled' && e.dataTransfer.dropEffect === 'none' && draggedItem.originDay) {
            // If dragged out of a valid drop zone and was scheduled, remove from origin
            // This logic might be too aggressive, consider if needed or if drop handles removal from origin better
             // setSchedule(prevSchedule => ({ ...prevSchedule, [draggedItem.originDay]: null, }));
        }
        setDraggedItem(null); setDragOverDay(null);
    };
    const handleDayDragOver = (e) => { e.preventDefault(); if (draggedItem) e.dataTransfer.dropEffect = 'move'; };
    const handleDayDragEnter = (e, day) => { e.preventDefault(); if (draggedItem) setDragOverDay(day); };
    const handleDayDragLeave = (e, day) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        if (dragOverDay === day) { setDragOverDay(null); }
    };
    const handleDayDrop = (e, targetDay) => {
        e.preventDefault();
        if (!draggedItem) return;
        const newSchedule = { ...schedule };
        const draggedInstructorInfo = draggedItem.item; // This is the instructor object {id, name, profileImage, degree}

        if (draggedItem.type === 'new') {
            // Dropping a new instructor
            // Check if targetDay already has an instructor, if so, temporarily store it
            const existingTargetData = newSchedule[targetDay];
            
            newSchedule[targetDay] = {
                instructor: draggedInstructorInfo,
                studyMode: studyModes[0].value, // Default study mode
            };

            // If targetDay had an instructor, and originDay (if any from a swap) is different, move it
            // This part of logic is complex if we want perfect swaps from list to occupied slot.
            // For now, new drop overwrites or fills empty.
        } else if (draggedItem.type === 'scheduled') {
            // Moving/Swapping a scheduled instructor
            const originDay = draggedItem.originDay;
            const originStudyMode = draggedItem.studyMode;

            if (originDay === targetDay) { // Dropped on the same day
                setDragOverDay(null);
                return;
            }
            
            const dataFromOriginDay = { instructor: draggedInstructorInfo, studyMode: originStudyMode };
            const dataFromTargetDay = newSchedule[targetDay]; // This could be null or { instructor: ..., studyMode: ... }

            // Place dragged item in target day
            newSchedule[targetDay] = dataFromOriginDay;

            // If targetDay was occupied, move its content to originDay. If not, clear originDay.
            newSchedule[originDay] = dataFromTargetDay ? dataFromTargetDay : null;
        }
        setSchedule(newSchedule);
        setDragOverDay(null);
        setDraggedItem(null); // Clear after drop
    };
    const handleRemoveInstructorFromDay = (day) => {
        setSchedule(prevSchedule => ({ ...prevSchedule, [day]: null, }));
    };
    const handleStudyModeChange = (day, newMode) => {
        setSchedule(prevSchedule => {
            if (prevSchedule[day] && prevSchedule[day].instructor) {
                return { ...prevSchedule, [day]: { ...prevSchedule[day], studyMode: newMode, }, };
            }
            return prevSchedule;
        });
    };

    // --- Save Schedule Function ---
    const handleSaveSchedule = async () => {
        setIsSavingSchedule(true); // Use a separate saving state for schedule
        setSaveStatus('saving');
        setSaveMessage('Saving schedule...');
        
        const schedulePayload = Object.entries(schedule)
            .filter(([_, dayData]) => dayData && dayData.instructor)
            .map(([day, dayData]) => ({
                day: day, // Mon, Tue, etc.
                instructorId: dayData.instructor.id,
                studyMode: dayData.studyMode, // 'in-class' or 'online'
                classId: classId // Include classId in each schedule item
            }));

        console.log("Payload to send to backend for schedule:", schedulePayload);

        try {
            // TODO: Replace with actual API call
            // await saveClassScheduleAPI(classId, schedulePayload);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            
            setSaveStatus('success');
            setSaveMessage('Schedule saved successfully!');
            setInitialScheduleForCheck(JSON.parse(JSON.stringify(schedule))); // Update baseline
            setIsDirty(false); // Reset dirty flag for schedule
        } catch (error) {
            console.error('Failed to save schedule:', error);
            setSaveStatus('error');
            setSaveMessage(error.message || 'An error occurred while saving schedule.');
        } finally {
            setIsSavingSchedule(false);
            setTimeout(() => {
                if (saveStatusRef.current !== 'saving') { 
                    setSaveMessage('');
                    setSaveStatus('');
                }
            }, 3000);
        }
    };

     // --- Download Schedule Function ---
    const handleDownloadSchedule = async () => { /* ... (remains the same) ... */ 
        const schedulePanelElement = document.getElementById('weeklySchedulePanel');
        if (!schedulePanelElement) { alert("Error: Schedule panel element not found."); return; }
        const scheduleIsEmpty = Object.values(schedule).every(dayData => !dayData || !dayData.instructor);
        if (scheduleIsEmpty) { alert("Schedule is empty. Nothing to download."); return; }
        // alert("Generating PDF, please wait... ⏳"); // Optional: or use a less intrusive loading state
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; // Prevent scrollbars during canvas capture

        try {
            const canvas = await html2canvas(schedulePanelElement, { scale: 2, useCORS: true, logging: false });
            document.body.style.overflow = originalOverflow; // Restore scrollbars
            const imgData = canvas.toDataURL('image/png');
            const orientation = canvas.width > canvas.height ? 'l' : 'p';
            const pdf = new jsPDF({ orientation: orientation, unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const margin = 20; // 20pt margin
            let newImgWidth = pdfWidth - 2 * margin;
            let newImgHeight = (imgProps.height * newImgWidth) / imgProps.width;
            if (newImgHeight > pdfHeight - 2 * margin) {
                newImgHeight = pdfHeight - 2 * margin;
                newImgWidth = (imgProps.width * newImgHeight) / imgProps.height;
            }
            const xOffset = (pdfWidth - newImgWidth) / 2;
            const yOffset = (pdfHeight - newImgHeight) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, newImgWidth, newImgHeight);
            pdf.save(`${currentData?.name || 'class'}_schedule.pdf`);
        } catch (error) {
            document.body.style.overflow = originalOverflow; // Restore scrollbars in case of error
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please check the console for details.");
        }
    };
    
    // --- Field Renderers ---
    const renderSelectField = (label, name, value, options, valueKey, labelKey) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label htmlFor={`${name}-select`} className="form-label block font-semibold text-xs ...">{label}</label>
            {isEditing ? (
                <select 
                    id={`${name}-select`} 
                    name={name} 
                    // The value of the select is the ID from the currently selected object
                    value={value?.[valueKey] || ''} 
                    onChange={handleInputChange} 
                    disabled={isSaving}
                    className="form-input w-full py-2 px-3 ...">
                    <option value="">-- Select {label} --</option>
                    {options.map(option => (
                        // Each option has the ID as its value
                        <option key={option[valueKey]} value={option[valueKey]}>
                            {option[labelKey]}
                        </option>
                    ))}
                </select>
            ) : (
                <input type="text" 
                    // Display the name property of the object
                    value={value?.[labelKey] || 'N/A'} 
                    readOnly
                    className="form-input w-full py-2 px-3 ..."/>
            )}
        </div>
    );
    const renderTextField = (label, name, value) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label htmlFor={`${name}-text`} className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing && name !== "status" ? ( // Status is usually not directly edited as a text field
                <input id={`${name}-text`} type="text" name={name} value={value || ''} onChange={handleInputChange} disabled={isSaving || (name === 'name' && !isNameManuallySet)}
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"/>
            ) : (
                <input id={`${name}-text`} type="text" value={value || 'N/A'} readOnly
                    className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"/>
            )}
        </div>
    );
     const renderStatusField = (label, name, value, options) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={isSaving}
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white">
                    {options.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
            ) : (
                 <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${value === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {value || 'N/A'}
                </span>
            )}
        </div>
    );

    // --- Effect for Dirty Checking Schedule ---
    useEffect(() => {
        if (initialScheduleForCheck) {
            setIsDirty(JSON.stringify(schedule) !== JSON.stringify(initialScheduleForCheck));
        } else {
            // If initialScheduleForCheck is null (e.g., schedule not loaded yet),
            // consider if it should be dirty or not. Defaulting to false.
            const isEmptyClientSchedule = Object.values(schedule).every(dayData => !dayData || !dayData.instructor);
            setIsDirty(!isEmptyClientSchedule); // Dirty if schedule has anything and initial check hasn't been set
        }
    }, [schedule, initialScheduleForCheck]);

    if (loading && !classDetails) return <ClassDetailSkeleton />;
    if (error && !classDetails) return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error} <button onClick={() => router.back()} className="ml-2 text-blue-500 hover:underline">Go Back</button></div>;
    if (!currentData) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Class not found or an error occurred. <button onClick={() => router.back()} className="ml-2 text-blue-500 hover:underline">Go Back</button></div>;
    
    const scheduleIsEmpty = Object.values(schedule).every(dayData => !dayData || !dayData.instructor);

    return (
        <div className='p-6 dark:text-white'>
            <div className="flex items-center justify-between mb-1">
                <h1 className="section-title font-semibold text-lg text-num-dark-text dark:text-white">
                    Class Details: {classDetails?.name || 'Loading...'}
                </h1>
                 { isEditing && saveMessage && (
                    <p className={`text-xs font-medium ${saveStatus === 'success' ? 'text-green-600 dark:text-green-400' : saveStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{saveMessage}</p>
                 )}
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-2 mb-4" />
            
            {error && !isEditing && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert"><span className="font-medium">Error:</span> {error}</div>}

            <div className="class-section flex flex-col gap-6">
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                             <h2 className="section-title font-semibold text-md text-num-dark-text dark:text-white">General Information</h2>
                             { !isEditing && (
                                <button onClick={handleEditToggle} className="edit-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-1.5 px-3 font-semibold text-xs cursor-pointer flex items-center gap-1" disabled={isSaving}>
                                    <EditIcon className="size-3.5"/> Edit
                                </button>
                             )}
                        </div>
                        
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Class Name", "name", currentData.name)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Generation", "generation", currentData.generation, generationOptions)}
                            {renderTextField("Group", "group", currentData.group)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Faculty/Department", "faculty", currentData.faculty, facultyOptions)} {/* API uses department.name */}
                            {renderSelectField("Degrees", "degrees", currentData.degrees, degreesOptions)}
                            {renderSelectField("Major", "major", currentData.major, majorOptions)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Semester", "semester", currentData.semester, semesterOptions)}
                            {renderSelectField("Shift", "shift", currentData.shift, shiftOptions)} {/* API uses shift object */}
                            {renderStatusField("Status", "status", currentData.status, statusOptions)}
                        </div>

                        {isEditing && (
                            <div className="form-actions flex justify-end items-center gap-3 mt-4">
                                <button onClick={handleCancelClick} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={isSaving}>Cancel</button>
                                <button onClick={handleEditToggle} className="save-button bg-green-600 hover:bg-green-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer flex items-center justify-center" disabled={isSaving}>
                                    {isSaving ? <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</> : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className='flex-grow flex flex-col lg:flex-row gap-6 min-w-[300px]'>
                    <div className='h-auto lg:max-h-[550px] lg:w-[250px] xl:w-[280px] flex-shrink-0 p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg self-start flex flex-col'>
                        <div> 
                            <h3 className="text-base sm:text-lg font-semibold mb-2 text-num-dark-text dark:text-gray-100 border-b dark:border-gray-600 pb-2">Available Instructors</h3>
                            <div className="my-3">
                                <input type="text" placeholder="Search name or degree..." className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 dark:placeholder-gray-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            </div>
                        </div>
                        <div className="space-y-3 flex-grow overflow-y-auto pr-1 min-h-[200px] lg:h-[350px]">
                            {availableInstructors.length > 0 ? availableInstructors.map((instructor) => (
                                <div key={instructor.id} draggable onDragStart={(e) => handleNewInstructorDragStart(e, instructor)} onDragEnd={handleNewInstructorDragEnd} className="p-3 bg-sky-50 dark:bg-sky-700 dark:hover:bg-sky-600 border border-sky-200 dark:border-sky-600 rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-150 ease-in-out flex items-center gap-3 group">
                                    {instructor.profileImage ? (<img src={instructor.profileImage} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" onError={(e) => { e.currentTarget.src = '/images/default-avatar.png'; /* Fallback */ }}/>) : (<DefaultAvatarIcon className={`w-10 h-10 flex-shrink-0`} /> )}
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-sky-800 dark:text-sky-100 group-hover:text-sky-900 dark:group-hover:text-white">{instructor.name}</p>
                                        {instructor.degree && (<p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{instructor.degree}</p>)}
                                    </div>
                                </div>)) : 
                                (<p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">{searchTerm ? 'No matching instructors.' : 'All instructors scheduled or none available.'}</p>)}
                        </div>
                    </div>

                    <div id="weeklySchedulePanel" className='flex-1 p-4 sm:p-6 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex flex-col'>
                        <div className="flex justify-between items-center mb-6 border-b dark:border-gray-600 pb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-num-dark-text dark:text-gray-100">Weekly Class Schedule</h3>
                            <div className="flex items-center gap-2">
                                { (isDirty || saveStatus === 'error') && !isSavingSchedule && (
                                    <button onClick={handleSaveSchedule} disabled={isSavingSchedule || !isDirty}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform active:scale-95 ${isDirty ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}>
                                        {isSavingSchedule ? 'Saving...' : 'Save Schedule Changes'}
                                    </button>
                                )}
                                 <button onClick={handleDownloadSchedule} disabled={isSavingSchedule || scheduleIsEmpty}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out transform active:scale-95 ${scheduleIsEmpty || isSavingSchedule ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400'}`}>
                                    Download
                                </button>
                            </div>
                        </div>
                         {saveMessage && saveStatusRef.current !== 'saving' && ( // Show schedule save status here
                            <p className={`text-xs mb-3 text-center font-medium ${saveStatus === 'success' ? 'text-green-600 dark:text-green-400' : saveStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{saveMessage}</p>
                         )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
                            {daysOfWeek.map((day) => (
                                <div key={day} onDragOver={handleDayDragOver} onDragEnter={(e) => handleDayDragEnter(e, day)} onDragLeave={(e) => handleDayDragLeave(e, day)} onDrop={(e) => handleDayDrop(e, day)}
                                    className={`p-3 rounded-lg min-h-[160px] sm:min-h-[240px] flex flex-col justify-start items-center group border-2 transition-all duration-200 ease-in-out ${dragOverDay === day && draggedItem ? 'bg-emerald-50 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-600 scale-105 shadow-lg' : 'bg-gray-50 dark:bg-gray-700/30 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 select-none pt-1">{day}</h4>
                                    {schedule[day] && schedule[day].instructor ? (<ScheduledInstructorCard instructorData={schedule[day]} day={day} onDragStart={handleScheduledInstructorDragStart} onDragEnd={handleScheduledInstructorDragEnd} onRemove={handleRemoveInstructorFromDay} studyMode={schedule[day].studyMode} onStudyModeChange={handleStudyModeChange}/>) : 
                                    (<div className="flex-grow flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic select-none px-2 text-center">Drag instructor here</div>)}
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                             <div className="text-xs text-gray-500 dark:text-gray-400">
                                Class: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.name} ({currentData.generation} - G{currentData.group})</span><br/>
                                Semester: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.semester}</span> | Shift: <span className="font-semibold text-num-dark-text dark:text-gray-100">{currentData.shift}</span>
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
            <Suspense fallback={<ClassDetailSkeleton />}>
                {/* Render the Client Component, passing the server-fetched data as props.
                  The browser receives the pre-rendered HTML for an instant load, then the
                  client-side JS hydrates the component to make it fully interactive.
                */}
                <ClassDetailClientView 
                    initialClassDetails={classDetails}
                    allInstructors={instructors}
                />
            </Suspense>
        </AdminLayout>
    );
}
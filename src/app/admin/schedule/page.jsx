'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import AdminLayout from '@/components/AdminLayout';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);


const PdfFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-600 dark:text-red-500">
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.343a2 2 0 00-.586-1.414l-4.414-4.414A2 2 0 0011.657 2H4zm5 0v3.5A1.5 1.5 0 0010.5 7H14V4H9zM8 11a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
  </svg>
);


// --- Mock Data ---
const MOCK_CLASSES = [
  { id: 'C001', name: '33/60 IT', year: 1, program: 'IT', generation: '33', color: 'bg-blue-500' }, // Blue
  { id: 'C002', name: '33/44 BIT', year: 1, program: 'BIT', generation: '33', color: 'bg-purple-500' }, // Purple
  { id: 'C003', name: '33/27 IT', year: 1, program: 'IT', generation: '33', color: 'bg-purple-500' }, // Purple
  { id: 'C004', name: '33/89 FB', year: 1, program: 'FB', generation: '33', color: 'bg-pink-500' },   // Pink
  { id: 'C005', name: '33/49 Law', year: 1, program: 'Law', generation: '33', color: 'bg-pink-500' },  // Pink
  { id: 'C006', name: '33/22 MG', year: 1, program: 'MG', generation: '33', color: 'bg-blue-500' },   // Blue
  { id: 'C007', name: '33/46 BS', year: 1, program: 'BS', generation: '33', color: 'bg-yellow-600' },// Yellow/Brownish
  { id: 'C008', name: '32/01 CS', year: 2, program: 'CS', generation: '32', color: 'bg-green-500' },
  { id: 'C009', name: '32/22 MG', year: 1, program: 'MG', generation: '32', color: 'bg-blue-500' },   // Blue
  { id: 'C0010', name: '32/46 BS', year: 1, program: 'BS', generation: '32', color: 'bg-yellow-600' },// Yellow/Brownish
  { id: 'C0011', name: '32/01 CS', year: 2, program: 'CS', generation: '32', color: 'bg-purple-500' },
];

const MOCK_ROOMS_LAYOUT = {
  "Building A": [
    { floor: 5, rooms: ["A21", "A22", "A23", "A24", "A25"] },
    { floor: 4, rooms: ["A16", "A17", "A18", "A19", "A20"] },
    { floor: 3, rooms: ["A11", "A12", "A13", "A14", "A15"] },
    { floor: 2, rooms: ["A6", "A7", "A8", "A9", "A10"] },
    { floor: 1, rooms: ["A1", "A2", "A3", "A4", "A5"] },
  ],
  "Building B": [ 
    { floor: 3, rooms: ["B10", "B11", "B12", "B13", "B14"] },
    { floor: 2, rooms: ["B5", "B6", "B7", "B8", "B9"] },
    { floor: 1, rooms: ["B1", "B2", "B3", "B4", "B5"] },
  ],
};

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const TIME_SLOTS = ['07:00 - 10:00', '10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00'];
const PROGRAMS = ['All', 'IT', 'BIT', 'FB', 'Law', 'MG', 'BS', 'CS']; 
const GENERATIONS = ['All', '33', '32'];


const getScheduleKey = (day, time, room) => `${day}-${time}-${room}`;

// --- Styling constants from image ---
const ROOM_HEADER_BG = 'bg-white dark:bg-gray-700';
const ROOM_BODY_BG_AVAILABLE = 'bg-[#F0F0F0] dark:bg-gray-600'; 
const ROOM_BODY_BG_OCCUPIED = 'bg-gray-50 dark:bg-gray-500/30';
const GREEN_DOT_COLOR = 'bg-[#48AA2B]';
const RED_DOT_COLOR = 'bg-red-500';
const SELECTED_DAY_BG = 'bg-yellow-400 dark:bg-yellow-500 text-black dark:text-gray-800';
const UNSELECTED_DAY_BG = 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600';

const DownloadPdfModal = ({ isOpen, onClose, onDownload, pdfInfo }) => {
  if (!isOpen) return null;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
      // Status update to "Downloaded" or similar is handled by parent via pdfInfo
    } catch (error) {
      console.error("Error during PDF download process:", error);
      // Parent can update status to "Error"
    } finally {
      setIsDownloading(false);
      // onClose(); // Optionally close modal after download attempt. User might want to see "Downloaded" status.
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-start mb-4"> {/* items-start for longer filenames */}
          <div className="pt-1"> {/* Align icon nicely with text */}
            <PdfFileIcon />
          </div>
          <div className="ml-4 flex-1 min-w-0"> {/* flex-1 and min-w-0 for text wrapping */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">{pdfInfo.filename}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pdfInfo.sizeEst ? `${pdfInfo.sizeEst} . ` : ''}
              {isDownloading ? "Generating..." : pdfInfo.status}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isDownloading && pdfInfo.status !== 'Download initiated' && pdfInfo.status !== 'Error generating PDF'}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {pdfInfo.status === 'Download initiated' || pdfInfo.status === 'Error generating PDF' ? 'Close' : 'Cancel'}
          </button>
          {pdfInfo.status !== 'Download initiated' && pdfInfo.status !== 'Error generating PDF' && (
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SchedulePageSkeleton = () => {
  const SkeletonCard = () => (
    <div className="h-[90px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
  );

  const SkeletonClassItem = () => (
     <div className="p-3 rounded-md bg-white dark:bg-gray-700/60 shadow-sm flex items-center animate-pulse">
        <div className="w-1 h-10 rounded-sm bg-gray-300 dark:bg-gray-600 mr-3"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Panel Skeleton */}
      <div className="w-full lg:w-[300px] bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 p-4 rounded-xl shadow-md flex-shrink-0">
        <div className="h-7 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-3.5 animate-pulse"></div>
        <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-3.5 animate-pulse"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-11 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-11 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-2.5">
          {[...Array(6)].map((_, i) => <SkeletonClassItem key={i} />)}
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="flex-1 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 p-4 rounded-xl shadow-custom-light">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="h-11 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        <hr className="my-3 border-gray-200 dark:border-gray-700"/>

        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
              </div>
              <div className="grid xl:grid-cols-5 lg:grid-cols-2 md:grid-cols-2 gap-3">
                {[...Array(5)].map((_, j) => <SkeletonCard key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SchedulePageContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState(PROGRAMS[0]); // 'All'
  const [selectedGenerationFilter, setSelectedGenerationFilter] = useState('33');

  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [selectedBuildingName, setSelectedBuildingName] = useState(Object.keys(MOCK_ROOMS_LAYOUT)[0]);
  
  const [schedule, setSchedule] = useState({}); // Removed type annotation
  const [draggedClass, setDraggedClass] = useState(null); // Removed type annotation

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfInfo, setPdfInfo] = useState({ filename: '', status: 'Ready', sizeEst: '~20 KB' });
  const [publicDate, setPublicDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  // Add useEffect to simulate loading data
  useEffect(() => {
    // Simulate a network request
    const timer = setTimeout(() => {
      // In a real app, you would fetch data here and then:
      // setData(fetchedData);
      setIsLoading(false); // Set loading to false after data is "fetched"
    }, 1500); // 1.5-second delay

    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateDate = () => {
        const now = new Date();
        // Use toLocaleString for consistent formatting, including seconds for ticking effect
        const formattedDate = now.toLocaleString('en-CA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', // Added seconds
            hour12: false 
        }).replace(',', ''); // en-CA might add a comma, remove it
        setPublicDate(formattedDate);
    };
    updateDate(); // Initial set
    const intervalId = setInterval(updateDate, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup
  }, []);

  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  // Removed duplicate definition of filteredClasses. This is the single definition.
  const filteredClasses = MOCK_CLASSES.filter(cls => 
    (cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     cls.program.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedProgramFilter === 'All' || cls.program === selectedProgramFilter) &&
    (selectedGenerationFilter === 'All' || cls.generation === selectedGenerationFilter)
  );

  const currentBuildingLayout = MOCK_ROOMS_LAYOUT[selectedBuildingName] || [];

  const handleDragStart = (e, classItem) => { // Removed type annotation for e and classItem
    setDraggedClass(classItem);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(classItem)); 
  };

  const handleDragOver = (e) => { // Removed type annotation for e
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, roomName) => { // Removed type annotation for e
    e.preventDefault();
    const classItemString = e.dataTransfer.getData('application/json');
    if (classItemString) {
        const classItem = JSON.parse(classItemString); // Removed type assertion
        const key = getScheduleKey(selectedDay, selectedTimeSlot, roomName);
        
        let newSchedule = {...schedule};
        Object.entries(newSchedule).forEach(([schKey, schClassId]) => {
            if (schClassId === classItem.id && schKey.startsWith(`${selectedDay}-${selectedTimeSlot}`)) {
            delete newSchedule[schKey];
            }
        });

        newSchedule[key] = classItem.id;
        setSchedule(newSchedule);
        setDraggedClass(null);
    }
  };
  
  const handleRemoveScheduledClass = (roomName) => { // Removed type annotation for roomName
    const key = getScheduleKey(selectedDay, selectedTimeSlot, roomName);
    setSchedule(prev => {
      const newSchedule = {...prev};
      delete newSchedule[key];
      return newSchedule;
    });
  };

  const totalRoomsInBuilding = currentBuildingLayout.reduce((acc, floor) => acc + floor.rooms.length, 0);
  const unavailableRoomsCount = Object.keys(schedule).filter(key => {
    const [day, time, roomFromKey] = key.split('-'); 
    let roomIsInCurrentBuilding = false;
    for (const floor of currentBuildingLayout) {
        if (floor.rooms.includes(roomFromKey)) {
            roomIsInCurrentBuilding = true;
            break;
        }
    }
    return day === selectedDay && time === selectedTimeSlot && roomIsInCurrentBuilding;
  }).length;
  const availableRoomsCount = totalRoomsInBuilding - unavailableRoomsCount;
  
  const getTimeSlotNameForFile = (timeSlot) => { // Removed type annotation for timeSlot
    if (timeSlot.startsWith('07:00')) return 'Morning';
    if (timeSlot.startsWith('10:00')) return 'LateMorning';
    if (timeSlot.startsWith('13:00')) return 'Afternoon';
    if (timeSlot.startsWith('16:00')) return 'Evening';
    return 'CustomTime';
  };

  const prepareAndOpenPdfModal = () => {
    const buildingNameClean = selectedBuildingName.replace(/\s+/g, '');
    const timeSlotName = getTimeSlotNameForFile(selectedTimeSlot);
    const dayName = selectedDay;

    const newFilename = `Schedule_${buildingNameClean}_${timeSlotName}_${dayName}.pdf`;
    setPdfInfo({
      filename: newFilename,
      status: 'Ready to generate',
      sizeEst: '~20 KB' 
    });
    setIsPdfModalOpen(true);
  };

  const handleActualPdfDownload = async () => {
    setPdfInfo(prev => ({ ...prev, status: 'Generating...' }));

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'p', 
        unit: 'mm',
        format: 'a4'
      });

      const title = `Schedule: ${selectedBuildingName} - ${selectedDay} - ${selectedTimeSlot}`;
      
      doc.setFontSize(16);
      doc.text(title, 14, 20); 

      const tableColumn = ["Floor", "Room", "Class Name", "Program", "Year"];
      const tableRows = []; // Removed type annotation

      currentBuildingLayout.forEach(floorData => {
        floorData.rooms.forEach(roomName => {
          const scheduleKey = getScheduleKey(selectedDay, selectedTimeSlot, roomName);
          const scheduledClassId = schedule[scheduleKey];
          const classDetails = scheduledClassId ? MOCK_CLASSES.find(c => c.id === scheduledClassId) : null;

          const rowData = [
            `Floor ${floorData.floor}`,
            roomName,
            classDetails ? classDetails.name : 'Available',
            classDetails ? classDetails.program : '-',
            classDetails ? classDetails.year.toString() : '-'
          ];
          tableRows.push(rowData);
        });
      });
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28, 
        theme: 'grid',
        headStyles: { fillColor: [30, 136, 229] , textColor: [255,255,255]}, 
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: {
            0: { cellWidth: 20 }, 
            1: { cellWidth: 25 }, 
            2: { cellWidth: 'auto' }, 
            3: { cellWidth: 25 }, 
            4: { cellWidth: 15 }, 
        }
      });
      
      const pdfOutput = doc.output('blob');
      const estimatedSizeKB = (pdfOutput.size / 1024).toFixed(1);

      doc.save(pdfInfo.filename); 
      setPdfInfo(prev => ({ ...prev, status: 'Download initiated', sizeEst: `${estimatedSizeKB} KB` }));
    } catch (error) {
      console.error("Failed to load PDF libraries or generate PDF:", error);
      setPdfInfo(prev => ({ ...prev, status: 'Error generating PDF' }));
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Panel: Class List */}
      <div className="w-full lg:w-[300px] bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 p-4 rounded-xl shadow-md flex-shrink-0">
        <h2 className="text-lg font-semibold mb-3.5 text-gray-900 dark:text-white">Class</h2>
        <input 
          type="text"
          placeholder="Search"
          className="w-full p-2.5 mb-3.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 mb-4">
          <select 
            className="w-1/2 p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs focus:ring-blue-500 focus:border-blue-500"
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
          >
            {PROGRAMS.map(prog => <option key={prog} value={prog}>{prog === 'All' ? 'Bachelor' : prog}</option>)}
          </select>
          <select 
            className="w-1/2 p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs focus:ring-blue-500 focus:border-blue-500"
            value={selectedGenerationFilter}
            onChange={(e) => setSelectedGenerationFilter(e.target.value)}
          >
            {GENERATIONS.map(gen => <option key={gen} value={gen}>{gen === 'All' ? 'Generation All' : `Generation ${gen}`}</option>)}
          </select>
        </div>

        <div className="space-y-2.5 max-h-[calc(100vh-350px)] overflow-y-auto pr-1 custom-scrollbar">
          {filteredClasses.map(classItem => (
            <div
              key={classItem.id}
              draggable
              onDragStart={(e) => handleDragStart(e, classItem)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm cursor-grab bg-white dark:bg-gray-700 hover:shadow-md transition-shadow flex items-center"
            >
              <div className={`w-1 h-10 rounded-sm ${classItem.color} mr-3`}></div>
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-white">{classItem.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Year {classItem.year}</p>
              </div>
            </div>
          ))}
           {filteredClasses.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No classes match filters.</p>}
        </div>
      </div>

      {/* Right Panel: Room Schedule */}
      <div className="flex-1 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 p-4 rounded-xl shadow-custom-light">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center">
                <CalendarIcon />
            </div>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-1.5 text-sm font-medium transition-colors
                    ${selectedDay === day 
                      ? SELECTED_DAY_BG
                      : UNSELECTED_DAY_BG}
                    border-r dark:border-r-gray-500 last:border-r-0`}
                >
                  {day}
                </button>
              ))}
            </div>
            <select 
                value={selectedBuildingName} 
                onChange={e => setSelectedBuildingName(e.target.value)}
                className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
                {Object.keys(MOCK_ROOMS_LAYOUT).map(building => (
                    <option key={building} value={building}>{building}</option>
                ))}
            </select>
          </div>
          <select 
            value={selectedTimeSlot} 
            onChange={e => setSelectedTimeSlot(e.target.value)}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </div>
        <hr className="my-3 border-gray-200 dark:border-gray-700"/>

        <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
          {currentBuildingLayout.length > 0 ? currentBuildingLayout.map(floorData => (
            <div key={`${selectedBuildingName}-floor-${floorData.floor}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <h4 className="text-xs font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Floor {floorData.floor}
                </h4>
                <hr className="flex-1 border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="grid xl:grid-cols-5 lg:grid-cols-2 md:grid-cols-2 gap-3">
                {floorData.rooms.map(roomName => {
                  const scheduleKey = getScheduleKey(selectedDay, selectedTimeSlot, roomName);
                  const scheduledClassId = schedule[scheduleKey];
                  const scheduledClassDetails = scheduledClassId ? MOCK_CLASSES.find(c => c.id === scheduledClassId) : null;
                  const isOccupied = !!scheduledClassDetails;

                  return (
                    <div
                      key={roomName}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, roomName)}
                      className={`h-[90px] border rounded-md flex flex-col group transition-all duration-150
                        ${draggedClass ? 'border-blue-500 border-dashed dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-500' : 'border-gray-300 dark:border-gray-500'}
                      `}
                    >
                      <div className={`h-[30px] rounded-t-md flex items-center justify-between px-2.5 relative ${ROOM_HEADER_BG}`}>
                        <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isOccupied ? RED_DOT_COLOR : GREEN_DOT_COLOR}`}></div>
                        <span className="ml-3.5 text-[13px] font-medium text-gray-600 dark:text-gray-300">{roomName}</span>
                        {isOccupied && (
                           <button 
                             onClick={() => handleRemoveScheduledClass(roomName)} 
                             className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Remove class"
                           >
                             <CloseIcon />
                           </button>
                        )}
                      </div>
                      <div className={`flex-1 p-1.5 flex items-center justify-center text-center rounded-b-md 
                        ${isOccupied ? ROOM_BODY_BG_OCCUPIED : ROOM_BODY_BG_AVAILABLE}`}>
                        {scheduledClassDetails ? (
                          <div className="text-[11px] leading-tight">
                            <p className="font-semibold text-gray-700 dark:text-white truncate w-[120px]">{scheduledClassDetails.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">Year {scheduledClassDetails.year}</p>
                          </div>
                        ) : (
                          <div className="w-full h-full"></div> 
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">No rooms found for this building.</p>}
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                <p><span className={`inline-block w-2.5 h-2.5 ${GREEN_DOT_COLOR} rounded-full mr-1.5 align-middle`}></span> Available Room : {availableRoomsCount}</p>
                <p><span className={`inline-block w-2.5 h-2.5 ${RED_DOT_COLOR} rounded-full mr-1.5 align-middle`}></span> Unavailable Room : {unavailableRoomsCount}</p>
            </div>
            <button 
                onClick={prepareAndOpenPdfModal} // Added onClick handler
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-md text-sm transition-colors">
                Download PDF file
            </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
            {/* Use publicDate state variable for display */}
            Public Date : {publicDate} 
        </p>
      </div>

      {/* PDF Download Modal */}
      <DownloadPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onDownload={handleActualPdfDownload}
        pdfInfo={pdfInfo}
      />
    </div>
  );
};


export default function AdminSchedulePage() {
  return (
    <AdminLayout activeItem="schedule" pageTitle="National University of Management"> 
      <SchedulePageContent />
    </AdminLayout>
  );
}

// Add this to your global CSS or a relevant CSS file for custom scrollbars if desired:
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #555;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #777;
}
*/
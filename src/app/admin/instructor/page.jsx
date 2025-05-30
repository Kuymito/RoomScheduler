// Suggested path: app/admin/instructors/page.jsx
'use client';

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Using the path to your AdminLayout

// --- SVG Icon Components ---
const AddIcon = ({ className = "w-4 h-4", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.25 8.5H12.75" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 4.25V12.75" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ className = "w-3 h-3", stroke = "currentColor" }) => ( 
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="3.25" stroke={stroke} strokeWidth="1.5"/>
    <path d="M7.53516 7.53516L10.0849 10.0849" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ArrowDownIcon = ({ className = "w-2 h-full", stroke = "rgba(23,23,23,0.2)" }) => (
  <svg className={className} viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1V9M4 9L1 6M4 9L7 6" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUpIcon = ({ className = "w-2 h-full", stroke = "rgba(23,23,23,0.2)" }) => (
  <svg className={className} viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9V1M4 1L1 4M4 1L7 4" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SortIcon = ({ className = "w-2 h-[15px]"}) => (
    <div className={`flex flex-col ${className} cursor-pointer`}>
        <ArrowUpIcon className="w-full h-1/2" />
        <ArrowDownIcon className="w-full h-1/2" />
    </div>
);

const EditIcon = ({ className = "w-[17px] h-[17px]" }) => (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.06671 2.125H4.95837C3.00254 2.125 2.12504 3.0025 2.12504 4.95833V12.0417C2.12504 13.9975 3.00254 14.875 4.95837 14.875H12.0417C13.9975 14.875 14.875 13.9975 14.875 12.0417V8.93333" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.6579 3.2658L6.28042 7.64327C6.10542 7.81827 5.93042 8.15055 5.89125 8.3928L5.64958 10.112C5.56625 10.7037 6.01958 11.157 6.61125 11.0737L8.33042 10.832C8.57292 10.7928 8.90542 10.6178 9.08042 10.4428L13.4579 6.0653C14.2662 5.25705 14.5796 4.26827 13.4579 3.14662C12.3362 2.03205 11.3479 2.45705 10.6579 3.2658Z" stroke="currentColor" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.8999 4.02502C10.2716 5.66752 11.0583 6.45419 12.7008 6.82585" stroke="currentColor" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ArchiveIcon = ({ className = "w-[17px] h-[17px]" }) => (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.1667 5.66667V12.0417C14.1667 13.9975 13.2892 14.875 11.3334 14.875H5.66671C3.71087 14.875 2.83337 13.9975 2.83337 12.0417V5.66667" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.875 2.125H2.125L2.12504 5.66667H14.875V2.125Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.79163 8.5H9.20829" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const KeyboardArrowDown = ({className = "w-3.5 h-3.5"}) => (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 5.26562L7 8.76562L10.5 5.26562" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- Sample Data ---
const sampleInstructors = [
  { id: 1, name: 'Uy Chakriya', phone: '012-345-678', email: 'chakriya.uy@example.com', degree: "PhD", major: 'Computer Science', active: true, profilePic: 'https://via.placeholder.com/40/FFA500/FFFFFF?Text=UC' },
  { id: 2, name: 'Sok Pisey', phone: '098-765-432', email: 'pisey.sok@example.com', degree: "MSc", major: 'Mathematics', active: true, profilePic: 'https://via.placeholder.com/40/3498DB/FFFFFF?Text=SP' },
  { id: 3, name: 'Chan Dara', phone: '011-223-344', email: 'dara.chan@example.com', degree: "BSc", major: 'Physics', active: false, profilePic: 'https://via.placeholder.com/40/2ECC71/FFFFFF?Text=CD' },
  { id: 4, name: 'Vong Nary', phone: '012-345-679', email: 'nary.vong@example.com', degree: "PhD", major: 'Computer Engineering', active: true, profilePic: 'https://via.placeholder.com/40/E74C3C/FFFFFF?Text=VN' },
  { id: 5, name: 'Kim Sour', phone: '098-765-431', email: 'sour.kim@example.com', degree: "MSc", major: 'Data Science', active: true, profilePic: 'https://via.placeholder.com/40/9B59B6/FFFFFF?Text=KS' },
];

// --- Content for the Instructors Page ---
const InstructorsDisplayContent = () => {
  const [activeFilter, setActiveFilter] = useState('Active'); 
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  const [nameColSearch, setNameColSearch] = useState('');
  const [phoneColSearch, setPhoneColSearch] = useState('');
  const [emailColSearch, setEmailColSearch] = useState('');
  const [degreeColSearch, setDegreeColSearch] = useState('');
  const [majorColSearch, setMajorColSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const filteredInstructors = useMemo(() => {
    return sampleInstructors.filter(instructor => {
      const matchesActiveFilter = activeFilter === 'Active' ? instructor.active : !instructor.active;
      
      const lowerGlobalSearchTerm = globalSearchTerm.toLowerCase();
      const matchesGlobalSearch = !globalSearchTerm ||
                            (instructor.name && instructor.name.toLowerCase().includes(lowerGlobalSearchTerm)) ||
                            (instructor.phone && instructor.phone.toLowerCase().includes(lowerGlobalSearchTerm)) ||
                            (instructor.email && instructor.email.toLowerCase().includes(lowerGlobalSearchTerm)) ||
                            (instructor.degree && instructor.degree.toLowerCase().includes(lowerGlobalSearchTerm)) ||
                            (instructor.major && instructor.major.toLowerCase().includes(lowerGlobalSearchTerm));

      const matchesNameCol = !nameColSearch || (instructor.name && instructor.name.toLowerCase().includes(nameColSearch.toLowerCase()));
      const matchesPhoneCol = !phoneColSearch || (instructor.phone && instructor.phone.toLowerCase().includes(phoneColSearch.toLowerCase()));
      const matchesEmailCol = !emailColSearch || (instructor.email && instructor.email.toLowerCase().includes(emailColSearch.toLowerCase()));
      const matchesDegreeCol = !degreeColSearch || (instructor.degree && instructor.degree.toLowerCase().includes(degreeColSearch.toLowerCase()));
      const matchesMajorCol = !majorColSearch || (instructor.major && instructor.major.toLowerCase().includes(majorColSearch.toLowerCase()));

      return matchesActiveFilter && matchesGlobalSearch && matchesNameCol && matchesPhoneCol && matchesEmailCol && matchesDegreeCol && matchesMajorCol;
    }).map(inst => ({...inst, status: inst.active ? 'Active' : 'Archived'}));
  }, [sampleInstructors, activeFilter, globalSearchTerm, nameColSearch, phoneColSearch, emailColSearch, degreeColSearch, majorColSearch]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredInstructors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredInstructors.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  const columnSearchInputStyle = "w-full h-[27px] border border-[#C9C9C9] rounded-[5px] px-2 text-xs placeholder:text-[#B4B4B4] focus:outline-none focus:border-num-blue bg-white";
  const tableHeaderCellBaseStyle = "flex items-center px-3 h-full border-l border-[#EFEFEF] font-sans font-semibold text-xs text-black gap-1";
  const tableDataCellBaseStyle = "flex items-center px-3 h-full border-l border-[#EFEFEF] font-sans text-black truncate";


  return (
    <div className="w-full h-full flex flex-col gap-4 md:gap-6 font-sans"> {/* Root of InstructorsDisplayContent, no card styles */}
      
      <div className="mb-4 w-full">
          <h2 className="text-base font-medium text-black">Instructor</h2>
          <hr className="border-t border-gray-200 mt-3" />
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[337px] h-[40px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-4 h-4 text-num-gray" />
            </div>
            <input 
              type="text"
              placeholder="Global Search..."
              value={globalSearchTerm}
              onChange={(e) => { setGlobalSearchTerm(e.target.value); setCurrentPage(1);}}
              className="box-border w-full h-full pl-10 pr-3 bg-num-content-bg border border-num-gray-light rounded-[10px] font-sans text-sm text-num-dark-text placeholder:text-num-gray focus:outline-none focus:border-num-blue focus:ring-1 focus:ring-num-blue"
            />
          </div>
          <div className="flex flex-row items-center w-full sm:w-auto h-[40px] shadow-sm">
            <button
              onClick={() => { setActiveFilter('Active'); setCurrentPage(1); }}
              className={`box-border flex flex-row justify-center items-center px-4 py-2 gap-2.5 flex-1 sm:flex-none sm:w-[90px] h-full rounded-l-[10px] font-sans text-sm leading-[15px] font-medium transition-colors
                          ${activeFilter === 'Active' ? 'bg-num-blue text-white' : 'bg-white text-black border border-r-0 border-num-gray-light hover:bg-gray-50'}`}
            >
              Active
            </button>
            <button
              onClick={() => { setActiveFilter('Archive'); setCurrentPage(1); }}
              className={`box-border flex flex-row justify-center items-center px-4 py-2 gap-2.5 flex-1 sm:flex-none sm:w-[90px] h-full rounded-r-[10px] font-sans text-sm leading-[15px] font-medium transition-colors
                          ${activeFilter === 'Archive' ? 'bg-num-blue text-white' : 'bg-white text-black border border-num-gray-light hover:bg-gray-50'}`}
            >
              Archive
            </button>
          </div>
        </div>
        <button className="w-full sm:w-auto h-[40px] bg-[#75B846] hover:bg-green-600 transition-colors rounded-[5px] flex items-center justify-center px-4 gap-2 text-white">
            <AddIcon className="w-[17px] h-[17px]" stroke="white"/>
            <span className="font-sans font-semibold text-xs leading-[15px]">
                CREATE
            </span>
        </button>
      </div>

      {/* Table Container - this has the border, rounding, and white background */}
      <div className="w-full flex flex-col flex-grow overflow-hidden border border-[#EFEFEF] rounded-[10px] bg-white">
        {/* Table Header Row */}
        <div className="flex flex-row w-full h-[45px] bg-white border-b border-[#EFEFEF] flex-none rounded-t-[10px]">
          <div className="flex items-center justify-center flex-none w-[100px] md:w-[120px] px-3 h-full font-sans font-semibold text-xs text-black">Action</div>
          <div className={`${tableHeaderCellBaseStyle} flex-1`}>Name <SortIcon /></div>
          <div className={`${tableHeaderCellBaseStyle} flex-1`}>Phone Number <SortIcon /></div>
          <div className={`${tableHeaderCellBaseStyle} flex-1`}>Email <SortIcon /></div>
          <div className={`${tableHeaderCellBaseStyle} flex-1`}>Degree <SortIcon /></div>
          <div className={`${tableHeaderCellBaseStyle} flex-1`}>Major <SortIcon /></div>
        </div>
        
        {/* Table Body - Scrollable */}
        <div className="flex-grow overflow-y-auto">
            {currentRecords.map((instructor) => (
            <div key={instructor.id} className="flex flex-row w-full h-[50px] bg-white border-b border-[#EFEFEF] items-center hover:bg-gray-50 transition-colors text-xs">
                <div className="flex items-center justify-center gap-2 flex-none w-[100px] md:w-[120px] px-3 h-full text-num-blue">
                    <button title="Edit" className="p-1 hover:bg-num-blue-light rounded"><EditIcon className="text-num-blue"/></button>
                    <button title="Archive" className="p-1 text-num-red hover:bg-red-100 rounded"><ArchiveIcon className="text-num-red"/></button>
                </div>
                <div className={`${tableDataCellBaseStyle} flex-1 gap-2`}>
                    <img src={instructor.profilePic} alt={instructor.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    <span className="truncate">{instructor.name}</span>
                </div>
                <div className={`${tableDataCellBaseStyle} flex-1`}>
                    <span>{instructor.phone}</span>
                </div>
                <div className={`${tableDataCellBaseStyle} flex-1`}>
                    <span>{instructor.email}</span>
                </div>
                <div className={`${tableDataCellBaseStyle} flex-1`}>
                    <span>{instructor.degree}</span>
                </div>
                <div className={`${tableDataCellBaseStyle} flex-1`}>
                    <span>{instructor.major}</span>
                </div>
            </div>
            ))}
            {currentRecords.length === 0 && (
                <div className="flex justify-center items-center h-[100px] text-num-gray">No instructors found.</div>
            )}
        </div>

        {/* Per-Column Search Inputs Row */}
        <div className="flex flex-row w-full h-[50px] bg-white border-t border-b border-[#EFEFEF] items-center flex-none">
            <div className="flex-none w-[100px] md:w-[120px] px-3 h-full"> {/* Spacer for Action column */} </div>
            <div className={`${tableDataCellBaseStyle.replace('truncate','')} flex-1`}><input type="text" placeholder="Search Name..." className={columnSearchInputStyle} value={nameColSearch} onChange={(e) => {setNameColSearch(e.target.value); setCurrentPage(1);}} /></div>
            <div className={`${tableDataCellBaseStyle.replace('truncate','')} flex-1`}><input type="text" placeholder="Search Phone..." className={columnSearchInputStyle} value={phoneColSearch} onChange={(e) => {setPhoneColSearch(e.target.value); setCurrentPage(1);}} /></div>
            <div className={`${tableDataCellBaseStyle.replace('truncate','')} flex-1`}><input type="text" placeholder="Search Email..." className={columnSearchInputStyle} value={emailColSearch} onChange={(e) => {setEmailColSearch(e.target.value); setCurrentPage(1);}} /></div>
            <div className={`${tableDataCellBaseStyle.replace('truncate','')} flex-1`}><input type="text" placeholder="Search Degree..." className={columnSearchInputStyle} value={degreeColSearch} onChange={(e) => {setDegreeColSearch(e.target.value); setCurrentPage(1);}} /></div>
            <div className={`${tableDataCellBaseStyle.replace('truncate','')} flex-1`}><input type="text" placeholder="Search Major..." className={columnSearchInputStyle} value={majorColSearch} onChange={(e) => {setMajorColSearch(e.target.value); setCurrentPage(1);}} /></div>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[45px] bg-white border-t border-[#EFEFEF] items-center justify-between px-4 py-2 sm:py-0 flex-none rounded-b-[10px]">
           <div className="flex items-center mb-2 sm:mb-0">
                 <span className="font-sans text-xs text-black">
                    {filteredInstructors.length > 0 ? `${indexOfFirstRecord + 1} - ${Math.min(indexOfLastRecord, filteredInstructors.length)}` : '0'} of {filteredInstructors.length} results
                </span>
            </div>
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className="font-sans text-xs text-black hidden md:inline">Rows per page:</span>
                <div className="relative">
                    <select 
                        value={recordsPerPage} 
                        onChange={(e) => {setRecordsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                        className="appearance-none box-border flex flex-row justify-center items-center px-2 py-1 w-auto h-[24px] border border-[#BFBFBF] rounded-[16px] font-sans text-[10px] text-black bg-white pr-6 focus:outline-none focus:border-num-blue"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none">
                        <KeyboardArrowDown className="w-3 h-3 text-black" />
                    </div>
                </div>
            </div>
            {totalPages > 0 && (
              <div className="box-border flex flex-row items-stretch border border-[#DBDBDB] rounded-[16px] h-[28px] overflow-hidden bg-white">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 font-sans text-[10px] text-[#737373] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  {[...Array(totalPages).keys()].map(num => num + 1).map(page => (
                      <button key={page} onClick={() => paginate(page)}
                              className={`px-3 py-1 font-sans text-[10px] border-l border-[#DBDBDB] 
                                          ${currentPage === page ? 'bg-[#E9E9E9] text-white border-l-[#969595] hover:bg-gray-600' : 'text-[#737373] hover:bg-gray-100'}`}>
                          {page}
                      </button>
                  ))}
                  <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 font-sans text-[10px] text-[#737373] border-l border-[#DBDBDB] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Default Export for the Page that USES AdminLayout ---
export default function InstructorsPage() {
  return (
    <AdminLayout pageTitle="Instructor List">
      <InstructorsDisplayContent />
    </AdminLayout>
  );
}
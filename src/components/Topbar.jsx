// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import ThemeToggle from './ThemeToggle'; // Assuming ThemeToggle is in the same directory or adjust path

// const Topbar = ({ onToggleSidebar, isSidebarCollapsed, onUserIconClick, breadcrumbs, userIconRef, onNotificationIconClick, notificationIconRef, hasUnreadNotifications, }) => {
//   return (
//     <div className="flex justify-between items-center w-full h-full"> 
//       <div className="topbar-content-left flex items-center">
//         <div
//           id="sidebar-toggle"
//           className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 select-none leading-none"
//           title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//           onClick={onToggleSidebar}
//         >
//           {isSidebarCollapsed ? <span dangerouslySetInnerHTML={{ __html: '&#x2715;' }} /> : <span dangerouslySetInnerHTML={{ __html: '&#9776;' }} />}
//         </div>
//         <div className="page-title font-medium text-xl text-black dark:text-white">
//           National University of Management
//           <div className="dashboard text-sm font-normal text-blue-600 mt-1 flex items-center">
//             {breadcrumbs.map((crumb, index) => (
//               <React.Fragment key={index}>
//                 {crumb.href ? (
//                   <Link href={crumb.href} className="hover:underline text-blue-600">
//                     {crumb.label}
//                   </Link>
//                 ) : (
//                   <span className="text-blue-700 dark:text-blue-400">{crumb.label}</span>
//                 )}
//                 {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">&gt;</span>}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className="topbar-icons flex items-center gap-4">
//         <ThemeToggle />
        
//         <div
//           ref={notificationIconRef} 
//           className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border  dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" // Added dark:border-gray-700 and dark:hover:bg-gray-800
//           onClick={onNotificationIconClick} 
//           title="Notifications"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-16 w-12 text-black dark:text-white">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
//           </svg>
//           {hasUnreadNotifications && (
//             <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>
//           )}
//         </div>
        
//         <div
//           ref={userIconRef}
//           className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
//           onClick={onUserIconClick}
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black dark:text-white">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Topbar;



// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import Link from 'next/link';
// import ThemeToggle from './ThemeToggle';

// const Topbar = ({
//   onToggleSidebar,
//   isSidebarCollapsed,
//   onUserIconClick,
//   breadcrumbs,
//   userIconRef,
//   onNotificationIconClick,
//   notificationIconRef,
//   hasUnreadNotifications,
// }) => {
//   const [lang, setLang] = useState({
//     name: 'English',
//     flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_the_United_States_%28Web_Colors%29.svg/1200px-Flag_of_the_United_States_%28Web_Colors%29.svg.png',
//   });

//   const [showLangDropdown, setShowLangDropdown] = useState(false);
//   const langDropdownRef = useRef(null);

//   const toggleLangDropdown = () => setShowLangDropdown((prev) => !prev);
//   const selectLang = (langName, flagUrl) => {
//     setLang({ name: langName, flag: flagUrl });
//     setShowLangDropdown(false);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
//         setShowLangDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const languages = [
//     {
//       name: 'English',
//       flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_the_United_States_%28Web_Colors%29.svg/1200px-Flag_of_the_United_States_%28Web_Colors%29.svg.png',
//     },
//     {
//       name: 'ខ្មែរ',
//       flag: 'https://media.istockphoto.com/id/1063896886/vector/flag-of-cambodia.jpg?s=612x612&w=0&k=20&c=Ts8iG6X0JOVXowAOU8V-YvCBZ7Q2BZZxPilqrZwX1Ys=',
//     },
//   ];

//   return (
//     <div className="flex justify-between items-center w-full h-full">
//       {/* Left Side */}
//       <div className="topbar-content-left flex items-center">
//         <div
//           id="sidebar-toggle"
//           className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 select-none leading-none"
//           title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
//           onClick={onToggleSidebar}
//         >
//           {isSidebarCollapsed ? (
//             <span dangerouslySetInnerHTML={{ __html: '&#x2715;' }} />
//           ) : (
//             <span dangerouslySetInnerHTML={{ __html: '&#9776;' }} />
//           )}
//         </div>

//         <div className="page-title font-medium text-xl text-black dark:text-white">
//           National University of Management
//           <div className="dashboard text-sm font-normal text-blue-600 mt-1 flex items-center">
//             {breadcrumbs.map((crumb, index) => (
//               <React.Fragment key={index}>
//                 {crumb.href ? (
//                   <Link href={crumb.href} className="hover:underline text-blue-600">
//                     {crumb.label}
//                   </Link>
//                 ) : (
//                   <span className="text-blue-700 dark:text-blue-400">{crumb.label}</span>
//                 )}
//                 {index < breadcrumbs.length - 1 && (
//                   <span className="mx-2 text-gray-400">&gt;</span>
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Right Side */}
//       <div className="topbar-icons flex items-center gap-4">
//         {/* Language Switch Dropdown */}
//         <div className="relative" ref={langDropdownRef}>
//           <div
//             className="lang-switch-btn w-[120px] h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2"
//             title="Change Language"
//             onClick={toggleLangDropdown}
//           >
//             <img src={lang.flag} alt={`${lang.name} Flag`} className="w-5 h-5 mr-1 rounded-sm flex-shrink-0" />
//             <span className={`text-black dark:text-white text-sm font-semibold truncate ${lang.name === 'ខ្មែរ' ? 'font-battambang' : ''}`}>
//               {lang.name}
//             </span>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2.5}
//               stroke="currentColor"
//               className="w-3 h-3 text-black dark:text-white ml-1 flex-shrink-0"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
//             </svg>
//           </div>
//           {showLangDropdown && (
//             <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
//               {languages.map((language) => (
//                 <div
//                   key={language.name}
//                   className="py-2 px-4 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white"
//                   onClick={() => selectLang(language.name, language.flag)}
//                 >
//                   <img src={language.flag} alt={`${language.name} Flag`} className="w-5 h-5 mr-2 rounded-sm flex-shrink-0" />
//                   <span className={language.name === 'ខ្មែរ' ? 'font-battambang' : ''}>
//                     {language.name}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Theme Toggle Button */}
//         <ThemeToggle />

//         {/* Notification Icon */}
//         <div
//           ref={notificationIconRef}
//           className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
//           onClick={onNotificationIconClick}
//           title="Notifications"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={1.5}
//             stroke="currentColor"
//             className="h-16 w-12 text-black dark:text-white"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
//             />
//           </svg>
//           {hasUnreadNotifications && (
//             <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>
//           )}
//         </div>

//         {/* User Icon */}
//         <div
//           ref={userIconRef}
//           className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
//           onClick={onUserIconClick}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={1.5}
//             stroke="currentColor"
//             className="size-6 text-black dark:text-white"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
//             />
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Topbar;



// src/components/Topbar.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';

// Define language options with codes
const languages = [
  {
    code: 'en',
    name: 'English',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_the_United_States_%28Web_Colors%29.svg/1200px-Flag_of_the_United_States_%28Web_Colors%29.svg.png',
  },
  {
    code: 'km',
    name: 'ខ្មែរ',
    flag: 'https://media.istockphoto.com/id/1063896886/vector/flag-of-cambodia.jpg?s=612x612&w=0&k=20&c=Ts8iG6X0JOVXowAOU8V-YvCBZ7Q2BZZxPilqrZwX1Ys=',
  },
];

const Topbar = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onUserIconClick,
  breadcrumbs,
  userIconRef,
  onNotificationIconClick,
  notificationIconRef,
  hasUnreadNotifications,
  // You might not explicitly need currentLanguageCode here if useTranslation is used directly
  // currentLanguageCode,
}) => {
  const { i18n } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef(null);

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleLangDropdown = () => setShowLangDropdown((prev) => !prev);

  const selectLang = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLangDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full h-full">
      {/* Left Side */}
      <div className="topbar-content-left flex items-center">
        <div
          id="sidebar-toggle"
          className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 select-none leading-none"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          onClick={onToggleSidebar}
        >
          {isSidebarCollapsed ? (
            <span dangerouslySetInnerHTML={{ __html: '✕' }} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: '☰' }} />
          )}
        </div>
        <div className="page-title font-medium text-xl text-black dark:text-white">
          National University of Management
          <div className="dashboard text-sm font-normal text-blue-600 mt-1 flex items-center">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:underline text-blue-600">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-blue-700 dark:text-blue-400">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400"></span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="topbar-icons flex items-center gap-4">
        {/* Language Switch Dropdown */}
        <div className="relative" ref={langDropdownRef}>
          <div
            className="lang-switch-btn w-[120px] h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2"
            title="Change Language"
            onClick={toggleLangDropdown}
          >
            {/* Enhanced Flag UI */}
            <img
              src={currentLanguage.flag}
              alt={`${currentLanguage.name} Flag`}
              className="w-6 h-auto mr-2 rounded-sm object-contain" // Changed w-5 h-5 to w-6 h-auto, added object-contain, increased mr-1 to mr-2
            />
            <span className={`text-black dark:text-white text-sm font-semibold truncate ${currentLanguage.code === 'km' ? 'font-battambang' : ''}`}>
              {currentLanguage.name}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3 text-black dark:text-white ml-1 flex-shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          {showLangDropdown && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
              {languages.map((language) => (
                <div
                  key={language.code}
                  className="py-2 px-4 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white"
                  onClick={() => selectLang(language.code)}
                >
                  {/* Enhanced Flag UI in Dropdown */}
                  <img
                    src={language.flag}
                    alt={`${language.name} Flag`}
                    className="w-6 h-auto mr-2 rounded-sm object-contain" // Changed w-5 h-5 to w-6 h-auto, added object-contain, increased mr-2
                  />
                  <span className={language.code === 'km' ? 'font-battambang' : ''}>{language.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notification Icon */}
        <div
          ref={notificationIconRef}
          className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onNotificationIconClick}
          title="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-16 w-12 text-black dark:text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          {hasUnreadNotifications && <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>}
        </div>

        {/* User Icon */}
        <div
          ref={userIconRef}
          className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onUserIconClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-black dark:text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
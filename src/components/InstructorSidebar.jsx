'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react'; // Import React

// --- Icon Components ---
const DashboardIcon = ({ className }) => (
  <svg className={className} width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.75 5.52422V2.68672C13.75 1.80547 13.35 1.44922 12.3563 1.44922H9.83125C8.8375 1.44922 8.4375 1.80547 8.4375 2.68672V5.51797C8.4375 6.40547 8.8375 6.75547 9.83125 6.75547H12.3563C13.35 6.76172 13.75 6.40547 13.75 5.52422Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.75 12.5555V10.0305C13.75 9.03672 13.35 8.63672 12.3563 8.63672H9.83125C8.8375 8.63672 8.4375 9.03672 8.4375 10.0305V12.5555C8.4375 13.5492 8.8375 13.9492 9.83125 13.9492H12.3563C13.35 13.9492 13.75 13.5492 13.75 12.5555Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5625 5.52422V2.68672C6.5625 1.80547 6.1625 1.44922 5.16875 1.44922H2.64375C1.65 1.44922 1.25 1.80547 1.25 2.68672V5.51797C1.25 6.40547 1.65 6.75547 2.64375 6.75547H5.16875C6.1625 6.76172 6.5625 6.40547 6.5625 5.52422Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5625 12.5555V10.0305C6.5625 9.03672 6.1625 8.63672 5.16875 8.63672H2.64375C1.65 8.63672 1.25 9.03672 1.25 10.0305V12.5555C1.25 13.5492 1.65 13.9492 2.64375 13.9492H5.16875C6.1625 13.9492 6.5625 13.5492 6.5625 12.5555Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClassIcon = ({ className }) => (
  <svg className={className} width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.25 14.5508H13.75" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.84375 14.5516L1.875 7.03279C1.875 6.65154 2.05625 6.28907 2.35625 6.05157L6.73125 2.64531C7.18125 2.29531 7.8125 2.29531 8.26875 2.64531L12.6438 6.04531C12.95 6.28281 13.125 6.64529 13.125 7.03279V14.5516" stroke="currentColor" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M8.125 11.4258H6.875C6.35625 11.4258 5.9375 11.8445 5.9375 12.3633V14.5508H9.0625V12.3633C9.0625 11.8445 8.64375 11.4258 8.125 11.4258Z" stroke="currentColor" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M5.9375 9.39453H4.6875C4.34375 9.39453 4.0625 9.11328 4.0625 8.76953V7.83203C4.0625 7.48828 4.34375 7.20703 4.6875 7.20703H5.9375C6.28125 7.20703 6.5625 7.48828 6.5625 7.83203V8.76953C6.5625 9.11328 6.28125 9.39453 5.9375 9.39453Z" stroke="currentColor" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M10.3125 9.39453H9.0625C8.71875 9.39453 8.4375 9.11328 8.4375 8.76953V7.83203C8.4375 7.48828 8.71875 7.20703 9.0625 7.20703H10.3125C10.6563 7.20703 10.9375 7.48828 10.9375 7.83203V8.76953C10.9375 9.11328 10.6563 9.39453 10.3125 9.39453Z" stroke="currentColor" strokeMiterlimit="10" strokeLinejoin="round"/>
    <path d="M11.8742 5.17578L11.8555 3.30078H9.10547" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const RoomIcon = ({ className }) => (
  <svg className={className} width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.25 14.1504H13.75" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.625 1.65039H4.375C2.5 1.65039 1.875 2.76914 1.875 4.15039V14.1504H13.125V4.15039C13.125 2.76914 12.5 1.65039 10.625 1.65039Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.375 10.7129H6.25" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.75 10.7129H10.625" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.375 7.90039H6.25" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.75 7.90039H10.625" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.375 5.08789H6.25" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.75 5.08789H10.625" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScheduleIcon = ({ className }) => (
  <svg className={className} width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1.44922V3.32422" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1.44922V3.32422" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.1875 5.88086H12.8125" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.25 14.5742C12.6307 14.5742 13.75 13.4549 13.75 12.0742C13.75 10.6935 12.6307 9.57422 11.25 9.57422C9.86929 9.57422 8.75 10.6935 8.75 12.0742C8.75 13.4549 9.86929 14.5742 11.25 14.5742Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.1809 12.1055H10.3184" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.25 11.1934V13.0621" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.125 5.51172V10.4242C12.6687 9.90546 12 9.57422 11.25 9.57422C9.86875 9.57422 8.75 10.693 8.75 12.0742C8.75 12.543 8.88125 12.9867 9.1125 13.3617C9.24375 13.5867 9.4125 13.7867 9.60625 13.9492H5C2.8125 13.9492 1.875 12.6992 1.875 10.8242V5.51172C1.875 3.63672 2.8125 2.38672 5 2.38672H10C12.1875 2.38672 13.125 3.63672 13.125 5.51172Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.49657 8.76172H7.50218" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.18407 8.76172H5.18968" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.18407 10.6367H5.18968" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpinnerIcon = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const NavItem = ({ href, icon: Icon, label, isActive, isCollapsed, onClick, isNavigating }) => (
  <Link href={href} passHref legacyBehavior>
    <a
      onClick={onClick}
      className={`nav-item flex items-center py-2.5 mb-1.5 rounded-[5px] cursor-pointer overflow-hidden transition-all duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800
        ${isActive ? 'hover:bg-sky-100 dark:hover:bg-blue-800' : ''}
        ${isCollapsed ? 'px-0 justify-center' : 'px-[60px]'}
        ${isNavigating ? 'cursor-wait opacity-70' : ''}`}
    >
      <div className={`nav-icon-wrapper transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-[15px]'}`}>
        {isNavigating ? (
            <SpinnerIcon className={`h-[15px] w-[15px] ${isActive ? 'text-num-blue' : 'text-[#737373] dark:text-gray-300'}`} />
        ) : (
            <Icon className={`h-[15px] w-[15px] ${isActive ? 'text-num-blue' : 'text-[#737373] dark:text-gray-300'}`} />
        )}
      </div>
      <div
        className={`nav-text text-xs whitespace-nowrap transition-all duration-150 ease-in-out
          ${isActive ? 'text-num-blue' : 'text-[#737373] dark:text-gray-300'}
          ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 max-w-[150px]'}`}
      >
        {label}
      </div>
    </a>
  </Link>
);

const InstructorSidebar = ({ isCollapsed, activeItem, onNavItemClick, navigatingTo }) => {
  const navItemsData = [
    {
      id: 'dashboard',
      href: '/instructor/dashboard',
      icon: DashboardIcon,
      label: 'Dashboard'
    },
    {
      id: 'class',
      href: '/instructor/class',
      icon: ClassIcon,
      label: 'Class'
    },
    {
      id: 'room',
      href: '/instructor/room',
      icon: RoomIcon,
      label: 'Room'
    },
    {
      id: 'schedule',
      href: '/instructor/schedule',
      icon: ScheduleIcon,
      label: 'Schedule'
    },
  ];

  return (
    <div
      id="sidebar"
      className={`sidebar fixed h-full bg-white dark:bg-gray-900 shadow-custom-medium py-5 flex flex-col transition-all duration-300 ease-in-out z-40`}
      style={{ width: isCollapsed ? '80px' : '265px' }}
    >
      <div className={`logo h-[50px] mb-5 flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-5'}`}>
        <Image
          src="/images/LOGO-NUM-1.png"
          alt="NUM Logo"
          width={isCollapsed ? 0 : 150}
          height={50}
          className={`logo-img ${isCollapsed ? 'hidden' : 'block h-[50px]'}`}
          style={{ width: isCollapsed ? 0 : 'auto' }}
        />
        <span className={`logo-text-collapsed font-bold text-lg text-black ${isCollapsed ? 'block' : 'hidden'}`}>
          <Image
            src="/images/LOGO-NUM-1.png"
            alt="NUM Logo"
            width={32}
            height={32}
          />
        </span>
      </div>
      <hr className="border-t border-num-gray-light dark:border-gray-700" />
      <div className="profile-info flex flex-col items-center my-7 overflow-hidden">
        <div
          className={`profile-avatar rounded-full mb-2.5 flex justify-center items-center
            ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
        >
          <Image
            src="/images/reach.jpg"
            alt="Instrucor Avatar"
            width={isCollapsed ? 32 : 60}
            height={isCollapsed ? 32 : 60}
            className={`profile-avatar-img rounded-full object-cover ${isCollapsed ? 'h-10 w-10' : 'h-[70px] w-[70px]'}`}
          />
        </div>
        <div
          className={`profile-texts-wrapper transition-opacity duration-200 ease-in-out
            ${isCollapsed ? 'opacity-0 max-w-0 h-0 overflow-hidden' : 'opacity-100 max-w-full'}`}
        >
          <div className="profile-name text-center font-semibold text-base text-black dark:text-white mb-1 whitespace-nowrap">
            Keo Linda
          </div>
          <div className="profile-email text-center text-[10px] text-num-gray dark:text-gray-200 whitespace-nowrap">
            KeoLinda@gmail.com
          </div>
        </div>
      </div>

      <nav className="nav-menu flex-grow mt-5 px-2">
        {navItemsData.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => onNavItemClick(item)}
            isNavigating={navigatingTo === item.id}
          />
        ))}
      </nav>
    </div>
  );
};

export default InstructorSidebar;
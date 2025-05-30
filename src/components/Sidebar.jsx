'use client';

import Image from 'next/image';
import Link from 'next/link';

const NavItem = ({ href, iconSrc, altText, label, isActive, isCollapsed, onClick }) => (
  <Link href={href} passHref legacyBehavior>
    <a
      onClick={onClick}
      className={`nav-item flex items-center py-2.5 mb-1.5 rounded-[5px] cursor-pointer overflow-hidden transition-all duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800
        ${isActive ? 'hover:bg-sky-100 dark:hover:bg-blue-800' : ''}
        ${isCollapsed ? 'px-0 justify-center' : 'px-[60px]'}`}
    >
      <div className={`nav-icon w-[15px] h-[15px] transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-[15px]'}`}>
        <Image src={iconSrc} alt={altText} width={15} height={15} className="h-full w-full text-[#737373]" />
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

const Sidebar = ({ isCollapsed, activeItem, onNavItemClick }) => {
  const navItemsData = [
    { 
      id: 'dashboard', 
      href: '/admin/dashboard', // Changed to absolute paths for clarity
      iconSrc: '/images/dashboard.svg', 
      altText: 'Dashboard', 
      label: 'Dashboard' 
    },
    { 
      id: 'class', 
      href: '/admin/class', 
      iconSrc: '/images/class.svg', 
      altText: 'Class', 
      label: 'Class' 
    },
    { 
      id: 'instructor', 
      href: '/admin/instructor', 
      iconSrc: '/images/instructor.svg', 
      altText: 'Instructor', 
      label: 'Instructor' 
    },
    { 
      id: 'room', 
      href: '/admin/room', 
      iconSrc: '/images/room.svg', 
      altText: 'Room', 
      label: 'Room'
    },
    { 
      id: 'schedule', 
      href: '/admin/schedule', 
      iconSrc: '/images/schedule.svg', 
      altText: 'Schedule', 
      label: 'Schedule' 
    },
  ];

  return (
    <div
      id="sidebar"
      className={`sidebar fixed h-full bg-white dark:bg-gray-900 shadow-custom-medium py-5 flex flex-col transition-all duration-300 ease-in-out z-40`}
      style={{ width: isCollapsed ? '80px' : '265px' }} // Dynamic width via style prop
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
            src="/images/admin.jpg"
            alt="Admin Avatar"
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
            Admin
          </div>
          <div className="profile-email text-center text-[10px] text-num-gray dark:text-gray-200 whitespace-nowrap">
            admin@gmail.com
          </div>
        </div>
      </div>

      <nav className="nav-menu flex-grow mt-5 px-2">
        {navItemsData.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            iconSrc={item.iconSrc}
            altText={item.altText}
            label={item.label}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => onNavItemClick(item.id)}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
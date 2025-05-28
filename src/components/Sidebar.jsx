'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname

// NavItem Sub-Component (kept within Sidebar.js for simplicity here)
const NavItem = ({ href, iconSrc, altText, label, isActive, isCollapsed, onClick }) => (
  <Link href={href} passHref legacyBehavior>
    <a
      onClick={onClick} // onClick from props, primarily for <Link> or other actions
      className={`nav-item flex items-center py-2.5 mb-1.5 rounded-[5px] cursor-pointer transition-all duration-300 ease-in-out overflow-hidden
        ${isActive ? '' : 'hover:bg-gray-100'} // Example active/hover background
        ${isCollapsed ? 'px-0 justify-center' : 'px-[60px]'}`} // Adjusted padding for consistency
    >
      <div className={`nav-icon w-[15px] h-[15px] transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-[15px]'}`}>
        <Image src={iconSrc} alt={altText} width={15} height={15} className="h-full w-full" />
      </div>
      <div
        className={`nav-text text-xs whitespace-nowrap transition-opacity duration-200 ease-in-out
          ${isActive ? 'text-blue-600 font-semibold' : 'text-[#737373]'} // Using Tailwind blue & font-semibold
          ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 max-w-[150px]'}`}
      >
        {label}
      </div>
    </a>
  </Link>
);

const Sidebar = ({ isCollapsed, onToggleSidebar }) => { // onToggleSidebar might be passed to a button if not handled by Topbar
  const pathname = usePathname(); // Get current path

  // Ensure your href paths match your actual application routes
  const navItemsData = [
    { id: 'dashboard', href: '/admin/dashboard', iconSrc: '/images/dashboardicon.png', altText: 'Dashboard', label: 'Dashboard' },
    { id: 'class', href: '/admin/class', iconSrc: '/images/classicon.png', altText: 'Class', label: 'Class' },
    { id: 'instructor', href: '/admin/instructor', iconSrc: '/images/instructoricon.png', altText: 'Instructor', label: 'Instructor' },
    { id: 'room', href: '/admin/room', iconSrc: '/images/roomicon.png', altText: 'Room', label: 'Room' },
    { id: 'schedule', href: '/admin/schedule', iconSrc: '/images/scheduleicon.png', altText: 'Schedule', label: 'Schedule' },
  ];

  let currentActiveItem = '';
  // Determine activeItem based on pathname more accurately
  // Find the longest matching href to handle nested routes correctly if they share prefixes
  let longestMatch = '';
  for (const item of navItemsData) {
    if (pathname.startsWith(item.href)) {
      if (item.href.length > longestMatch.length) {
        longestMatch = item.href;
        currentActiveItem = item.id;
      }
    }
  }
   // If no specific item matches but we are in a general admin path, default to dashboard
   if (!currentActiveItem && pathname.startsWith('/admin/profile')) {
    currentActiveItem = ' '; // Or any other appropriate default
  }


  const handleNavItemClick = (itemId) => {
    // This function is called when a NavItem's <a> tag is clicked.
    // Since <Link> handles navigation, this could be used for:
    // 1. Closing a mobile menu (if applicable)
    // 2. Analytics tracking
    // 3. If 'onToggleSidebar' were passed and we want to collapse on nav for mobile
    console.log(`NavItem ${itemId} clicked, Link will navigate.`);
  };

  return (
    <div
      id="sidebar"
      className={`sidebar bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-40
        ${isCollapsed ? 'w-[80px]' : 'w-[265px]'}`} // shadow-custom-medium -> shadow-lg
    >
      <div className={`logo h-[50px] mb-5 flex mt-5 items-center justify-center ${isCollapsed ? 'px-0' : 'px-5'}`}>
        {/* Collapsed Logo (Icon only) */}
        <Link href="/admin/dashboard" className={`logo-collapsed ${isCollapsed ? 'block' : 'hidden'}`}>
            <Image src="/images/LOGO-NUM-1.png" alt="NUM Icon" width={32} height={32} />
        </Link>
        {/* Expanded Logo */}
        <Link href="/admin/dashboard" className={`logo-expanded ${isCollapsed ? 'hidden' : 'block'}`}>
            <Image src="/images/LOGO-NUM-1.png" alt="NUM Logo" width={150} height={50} style={{ height: '50px', width: 'auto' }} />
        </Link>
      </div>
      <hr className="border-t border-gray-200" /> {/* border-num-gray-light -> border-gray-200 */}
      
      <div className="profile-info flex flex-col items-center my-7 overflow-hidden">
        <div className={`profile-avatar rounded-full bg-gray-100 mb-2.5 flex justify-center items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}> {/* bg-num-content-bg -> bg-gray-100 */}
          <Image src="/images/kok.png" alt="Admin Avatar" width={isCollapsed ? 32 : 60} height={isCollapsed ? 32 : 60} className="profile-avatar-img rounded-full object-cover" />
        </div>
        <div className={`profile-texts-wrapper transition-opacity duration-200 ease-in-out ${isCollapsed ? 'opacity-0 max-w-0 h-0 overflow-hidden' : 'opacity-100 max-w-full'}`}>
          <div className="profile-name text-center font-semibold text-base text-black mb-1 whitespace-nowrap">Admin</div>
          <div className="profile-email text-center text-[10px] text-gray-600 whitespace-nowrap">admin@gmail.com</div> {/* text-num-gray -> text-gray-600 */}
        </div>
      </div>

      <nav className="nav-menu flex-grow mt-5 px-2.5"> {/* Added some padding for nav items container */}
        {navItemsData.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            iconSrc={item.iconSrc}
            altText={item.altText}
            label={item.label}
            isActive={currentActiveItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => handleNavItemClick(item.id)}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
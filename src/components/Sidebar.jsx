// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';

// const NavItem = ({ href, iconSrc, altText, label, isActive, isCollapsed, onClick }) => (
//   <Link href={href} passHref legacyBehavior>
//     <a
//       onClick={onClick}
//       className={`nav-item flex items-center py-2.5 mb-1.5 rounded-[5px] cursor-pointer transition-all duration-300 ease-in-out overflow-hidden hover:bg-gray-100
//         ${isActive ? 'hover:bg-sky-100' : ''}
//         ${isCollapsed ? 'px-0 justify-center' : 'px-[60px]'}`}
//     >
//       <div className={`nav-icon  w-[15px] h-[15px] transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-[15px]'}`}>
//         <Image src={iconSrc} alt={altText} width={15} height={15} className="h-full w-full" />
//       </div>
//       <div
//         className={`nav-text text-xs whitespace-nowrap transition-opacity duration-200 ease-in-out hover:text-g
//           ${isActive ? 'text-num-blue' : 'text-[#737373]'}
//           ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 max-w-[150px]'}`}
//       >
//         {label}
//       </div>
//     </a>
//   </Link>
// );

// const Sidebar = ({ isCollapsed, activeItem, onNavItemClick }) => {
//   const navItemsData = [
//     { id: 'dashboard', href: 'dashboard', iconSrc: '/images/dashboardicon.png', altText: 'Dashboard', label: 'Dashboard' },
//     { id: 'class', href: 'class', iconSrc: '/images/classicon.png', altText: 'Class', label: 'Class' },
//     { id: 'instructor', href: 'instructor', iconSrc: '/images/instructoricon.png', altText: 'Instructor', label: 'Instructor' },
//     { id: 'room', href: 'room', iconSrc: '/images/roomicon.png', altText: 'Room', label: 'Room' },
//     { id: 'schedule', href: 'schedule', iconSrc: '/images/scheduleicon.png', altText: 'Schedule', label: 'Schedule' },
//   ];

//   return (
//     <div
//       id="sidebar"
//       className={`sidebar bg-white dark:bg-slate-700 shadow-custom-medium py-5 flex flex-col transition-all duration-300 ease-in-out z-40
//         ${isCollapsed ? 'w-[80px]' : 'w-[265px]'}`}
//     >
//       <div className={`logo h-[50px] mb-5 flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-5'}`}>
//         <Image
//           src="/images/LOGO-NUM-1.png"
//           alt="NUM Logo"
//           width={isCollapsed ? 0 : 150}
//           height={50}
//           className={`logo-img ${isCollapsed ? 'hidden' : 'block h-[50px]'}`}
//           style={{ width: isCollapsed ? 0 : 'auto' }}
//         />
//         <span className={`logo-text-collapsed font-bold text-lg text-black ${isCollapsed ? 'block' : 'hidden'}`}>
//         <Image
//           src="/images/LOGO-NUM-1.png"
//           alt="NUM Logo"
//             width={32}
//             height={32}
//         />
//         </span>
//       </div>
//       <hr className="border-t border-num-gray-light" />
//       <div className="profile-info flex flex-col items-center my-7 overflow-hidden">
//         <div
//           className={`profile-avatar rounded-ful mb-2.5 flex justify-center items-center transition-all duration-300 ease-in-out
//             ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
//         >
//           <Image
//             src="/images/kok.png"
//             alt="Admin Avatar"
//             width={isCollapsed ? 32 : 60}
//             height={isCollapsed ? 32 : 60}
//             className={`profile-avatar-img rounded-full object-cover ${isCollapsed ? 'h-10 w-10' : 'h-[70px] w-[70px]'}`}
//           />
//         </div>
//         <div
//           className={`profile-texts-wrapper transition-opacity duration-200 ease-in-out
//             ${isCollapsed ? 'opacity-0 max-w-0 h-0 overflow-hidden' : 'opacity-100 max-w-full'}`}
//         >
//           <div className="profile-name text-center font-semibold text-base text-black dark: text-white mb-1 whitespace-nowrap">
//             Admin
//           </div>
//           <div className="profile-email text-center text-[10px] text-num-gray dark: text-white whitespace-nowrap">
//             admin@gmail.com
//           </div>
//         </div>
//       </div>

//       <nav className="nav-menu flex-grow mt-5 px-2">
//         {navItemsData.map((item) => (
//           <NavItem
//             key={item.id}
//             href={item.href}
//             iconSrc={item.iconSrc}
//             altText={item.altText}
//             label={item.label}
//             isActive={activeItem === item.id}
//             isCollapsed={isCollapsed}
//             onClick={() => onNavItemClick(item.id)}
//           />
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;

'use client';

import Image from 'next/image';
import Link from 'next/link';

const NavItem = ({ href, iconSrc, altText, label, isActive, isCollapsed, onClick }) => (
  // Modern Next.js Link usage: Link component directly wraps the content
  // without an inner <a> tag, unless specific legacyBehavior is needed.
  // The onClick handler is placed on the Link component itself.
  <Link href={href} onClick={onClick} className="block" aria-label={label}>
    <div
      className={`nav-item flex items-center py-2.5 mb-1.5 rounded-[5px] cursor-pointer transition-all duration-300 ease-in-out overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-700
        ${isActive ? 'bg-sky-100 hover:bg-sky-200 dark:bg-sky-800 dark:hover:bg-sky-700' : ''}
        ${isCollapsed ? 'px-0 justify-center' : 'px-[60px]'}`}
    >
      <div className={`nav-icon w-[15px] h-[15px] transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-[15px]'}`}>
        {/* For small fixed-size icons, 'fill' might be better for SVG or
            ensure width/height props match intrinsic size for bitmap images. */}
        <Image src={iconSrc} alt={altText} width={15} height={15} className="h-full w-full object-contain" />
      </div>
      <div
        className={`nav-text text-xs whitespace-nowrap transition-opacity duration-200 ease-in-out
          ${isActive ? 'text-num-blue dark:text-sky-300' : 'text-[#737373] dark:text-gray-300'}
          ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 max-w-[150px]'}`}
      >
        {label}
      </div>
    </div>
  </Link>
);

const Sidebar = ({ isCollapsed, activeItem, onNavItemClick }) => {
  const navItemsData = [
    { id: 'dashboard', href: '/dashboard', iconSrc: '/images/dashboardicon.png', altText: 'Dashboard', label: 'Dashboard' },
    { id: 'class', href: '/class', iconSrc: '/images/classicon.png', altText: 'Class', label: 'Class' },
    { id: 'instructor', href: '/instructor', iconSrc: '/images/instructoricon.png', altText: 'Instructor', label: 'Instructor' },
    { id: 'room', href: '/room', iconSrc: '/images/roomicon.png', altText: 'Room', label: 'Room' },
    { id: 'schedule', href: '/schedule', iconSrc: '/images/scheduleicon.png', altText: 'Schedule', label: 'Schedule' },
  ];

  return (
    <div
      id="sidebar"
      className={`sidebar bg-white dark:bg-slate-700 shadow-custom-medium py-5 flex flex-col transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? 'w-[80px]' : 'w-[265px]'}`}
    >
      <div className={`logo h-[50px] mb-5 flex items-center justify-center ${isCollapsed ? 'px-0' : 'px-5'}`}>
        {/* Use a single Image component for the logo, conditionally rendered or sized */}
        {!isCollapsed ? (
          <Image
            src="/images/LOGO-NUM-1.png"
            alt="NUM Logo"
            width={150} // Actual width for full logo
            height={50} // Actual height for full logo
            className="logo-img h-[50px] w-auto" // Tailwind classes for display size
            priority // Prioritize loading for LCP
          />
        ) : (
          <Image
            src="/images/LOGO-NUM-1.png" // Assuming the same logo can be scaled down
            alt="NUM Logo (Collapsed)"
            width={32} // Width for collapsed state
            height={32} // Height for collapsed state
            className="logo-img"
            priority
          />
        )}
      </div>
      <hr className="border-t border-num-gray-light dark:border-gray-600" />
      <div className="profile-info flex flex-col items-center my-7 overflow-hidden">
        <div
          className={`profile-avatar mb-2.5 flex justify-center items-center transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
        >
          {/* Ensure Image width/height props match the rendered size as closely as possible */}
          <Image
            src="/images/kok.png"
            alt="Admin Avatar"
            width={isCollapsed ? 40 : 70} // Match Tailwind w/h for better Image optimization
            height={isCollapsed ? 40 : 70} // Match Tailwind w/h for better Image optimization
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
          <div className="profile-email text-center text-[10px] text-num-gray dark:text-white whitespace-nowrap">
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
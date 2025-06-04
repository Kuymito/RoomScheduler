export default function DashboardHeader({
  title,
  description,
  currentDate,
  academicYear,
}) {
  return (
    <>
      <div
        className="
          flex flex-col md:flex-row md:justify-between md:items-start 
          p-4 sm:p-6 
          mb-4 
          space-y-10
          rounded-lg 
          num-dark-bg bg-white dark:bg-gray-900
        "
      >
        <div className="mb-4 md:mb-0 md:mr-6">
          {" "}
          <h1
            className="
              space-y-10
              text-lg sm:text-xl 
              font-bold 
              text-gray-800 dark:text-gray-100 
            "
          >
            {title}
          </h1>
          <p
            className="
              text-sm sm:text-xs sm:text-semibold 
              text-gray-700 dark:text-gray-300 
              mt-4
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            text-xs sm:text-sm 
            text-gray-600 dark:text-gray-400 
            md:text-right 
            flex-shrink-0
            mt-10
          "
        >
          <p className="text-xs">{`Date: ${currentDate}`}</p>
          <p className="text-xs mt-1">{`Academic Year: ${academicYear}`}</p>{" "}
        </div>

      </div>
    </>
  );
}
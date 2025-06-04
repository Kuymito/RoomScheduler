export default function StatCard({ title, value }) {
  return (
    <div className="dark:border-gray-500 bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow dark:bg-gray-900"> {/* h-36 removed here */}
      <h3 className="
        text-xs sm:text-sm 
        font-medium 
        text-gray-500 
        dark:text-gray-400 
      ">
        {title}
      </h3>
      <p className="
        text-2xl md:text-2xl 
        font-semibold 
        text-gray-800 
        dark:text-gray-100
        mt-1 sm:mt-2
      ">
        {value}
      </p>
    </div>
  );
}
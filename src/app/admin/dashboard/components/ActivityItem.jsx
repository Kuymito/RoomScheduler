export default function ActivityItem({ icon, type, time }) {
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors h-auto">
      <span className="text-xl mr-3">{icon || ''}</span>
      <div>
        <p className="text-sm font-medium text-gray-800">{type}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
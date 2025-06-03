import ActivityItem from './ActivityItem'; 
export default function RecentActivity({ activities }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Recent Activity</h3>
        <button className="text-gray-500 hover:text-gray-700">
          &#x2026; 
        </button>
      </div>
      <div className="space-y-3">
        {activities && activities.length > 0 
        ?
         (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              icon={activity.icon}
              type={activity.type}
              time={activity.time}
            />
          ))
        ) 
        : (
          <p className="text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
}
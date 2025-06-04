import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS,CategoryScale, LinearScale,BarElement, Title,Tooltip,Legend,} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RoomAvailabilityChart({ chartData, selectedTimeSlot, setSelectedTimeSlot }) {
  const timeSlots = ['07:00 - 10:00', '10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00'];
  const data = {
    labels: chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Rooms Available',
        data: chartData?.data || [0,0,0,0,0,0,0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 60,
        grid: {
          drawBorder: false,
        },
        ticks: {
          stepSize: 10,
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (!chartData) {
    return <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-200">Loading chart data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between pb-10 items-center  ">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">Room Available</h3>
        <select
          value={selectedTimeSlot}
          onChange={(e) => setSelectedTimeSlot(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
        >
          {timeSlots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>
      
      <div className="h-96">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
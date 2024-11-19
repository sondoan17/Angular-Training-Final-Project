import { Card, Progress } from 'antd';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectProgressProps {
  tasks: Array<{
    status: string;
  }>;
}

type StatusCounts = {
  'Not Started': number;
  'In Progress': number;
  'Stuck': number;
  'Done': number;
  [key: string]: number;
};

const ProjectProgress = ({ tasks = [] }: ProjectProgressProps) => {
  const calculateProgress = () => {
    if (!tasks?.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getStatusCounts = () => {
    const counts: StatusCounts = {
      'Not Started': 0,
      'In Progress': 0,
      'Stuck': 0,
      'Done': 0
    };
    tasks?.forEach(task => {
      if (task.status in counts) {
        counts[task.status] += 1;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Tasks by Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          '#F9FAFB',  // To Do
          '#EFF6FF',  // In Progress
          '#FEF2F2', // Stuck
          '#F0FDF4',  // Completed
        ],
        borderColor: [
          '#9CA3AF', // To Do - Gray
          '#3B82F6', // In Progress - Blue  
          '#EF4444', // Stuck - Red
          '#10B981', // Completed - Green
        ],
        borderWidth: 1,
      },
    ],
  };

  const progress = calculateProgress();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Overall Progress</h3>
        <div className="flex flex-col items-center justify-center">
          <Progress
            type="circle"
            percent={progress}
            size={200}
            strokeWidth={10}
            strokeColor={{
              '0%': '#3B82F6',
              '100%': '#10B981',
            }}
            trailColor="#E5E7EB"
            format={(percent) => (
              <div className="text-center">
                <div className="text-2xl font-bold">{percent}%</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            )}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {tasks.filter(task => task.status === 'Completed').length} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
      </Card>
      <Card className="dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Tasks Distribution</h3>
        <Chart type="bar" data={chartData} />
      </Card>
    </div>
  );
};

export default ProjectProgress;

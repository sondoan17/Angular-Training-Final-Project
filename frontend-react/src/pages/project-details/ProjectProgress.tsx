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
  'To Do': number;
  'In Progress': number;
  'In Review': number;
  'Completed': number;
  [key: string]: number;
};

const ProjectProgress = ({ tasks }: ProjectProgressProps) => {
  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getStatusCounts = () => {
    const counts: StatusCounts = {
      'To Do': 0,
      'In Progress': 0,
      'In Review': 0,
      'Completed': 0
    };
    tasks.forEach(task => {
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
          '#FEF2F2', // In Review
          '#F0FDF4',  // Completed
        ],
        borderColor: [
          '#9CA3AF', // To Do - Gray
          '#3B82F6', // In Progress - Blue  
          '#EF4444', // In Review - Red
          '#10B981', // Completed - Green
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Overall Progress</h3>
        <Progress
          type="circle"
          percent={calculateProgress()}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          className="flex justify-center"
        />
      </Card>
      <Card className="dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Tasks Distribution</h3>
        <Chart type="bar" data={chartData} />
      </Card>
    </div>
  );
};

export default ProjectProgress;

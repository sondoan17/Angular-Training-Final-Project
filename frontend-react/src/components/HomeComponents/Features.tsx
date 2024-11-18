import { FileTextOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';

const Features = () => {
  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: '32px' }} className="text-indigo-600" />,
      title: "Task Organization",
      description: "Easily organize and prioritize your tasks with our intuitive interface."
    },
    {
      icon: <TeamOutlined style={{ fontSize: '32px' }} className="text-indigo-600" />,
      title: "Team Collaboration",
      description: "Collaborate seamlessly with your team members in real-time."
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '32px' }} className="text-indigo-600" />,
      title: "Progress Tracking",
      description: "Monitor your project progress with detailed analytics and reports."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="bg-indigo-100 rounded-xl p-3 inline-block">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
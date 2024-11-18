import { CheckOutlined } from '@ant-design/icons';

const FeatureSections = () => {
  const sections = [
    {
      title: "Effortless Task Organization",
      description: "Our intuitive interface makes it easy to create, prioritize, and manage tasks. Stay organized and boost your productivity with Planify.",
      image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1729743933/task-organization.gif",
      features: [
        "Create and assign tasks with ease",
        "Set priorities and deadlines",
        "Organize tasks into projects and categories"
      ],
      imagePosition: "right"
    },
    {
      title: "Seamless Team Collaboration",
      description: "Work together in real-time, share ideas, and stay on the same page with Planify's powerful collaboration features.",
      image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1731037001/comment_ngglkw.png",
      features: [
        "Real-time updates and notifications",
        "Comment and discuss tasks directly",
        "Share files and documents effortlessly"
      ],
      imagePosition: "left"
    },
    {
      title: "Insightful Progress Tracking",
      description: "Stay on top of your projects with detailed analytics and reports. Visualize progress and make data-driven decisions.",
      image: "https://res.cloudinary.com/db2tvcbza/image/upload/v1730878814/progress_wnebcm.png",
      features: [
        "Interactive dashboards and charts",
        "Custom reports and analytics",
        "Track time spent on tasks and projects"
      ],
      imagePosition: "right"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mt-32 space-y-32">
        {sections.map((section, index) => (
          <section
            key={index}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className={index % 2 === 1 ? 'md:order-2' : ''}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">{section.title}</h2>
              <p className="text-lg text-gray-600 mb-8">{section.description}</p>
              <ul className="space-y-4">
                {section.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700">
                    <CheckOutlined className="h-5 w-5 text-indigo-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`bg-white p-4 rounded-2xl shadow-2xl ${index % 2 === 1 ? 'md:order-1' : ''}`}>
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-auto rounded-xl"
                crossOrigin="anonymous"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default FeatureSections;
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

const Hero = () => {
  return (
    <main className="pt-32 pb-20">
      <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Work smarter with the
            <span className="text-indigo-600 block mt-2">
              #1 task management platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Plan, manage and track all your team's tasks in one flexible platform.
            Boost productivity and collaboration today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started for Free
            <ArrowRightOutlined className="ml-2" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Hero;
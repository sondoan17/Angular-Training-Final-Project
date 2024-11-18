import { Link } from 'react-router-dom';
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, GithubOutlined } from '@ant-design/icons';

const Footer = () => {
  const links = {
    product: ['Features', 'Pricing', 'Documentation', 'Guides'],
    company: ['About', 'Blog', 'Careers', 'Contact'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img
              src="https://res.cloudinary.com/db2tvcbza/image/upload/v1730869163/logo_sfhhhd.png"
              alt="Planify"
              className="h-8 mb-4"
              crossOrigin="anonymous"
            />
            <p className="text-sm">
              Making project management simple and effective for teams of all sizes.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookOutlined className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterOutlined className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <LinkedinOutlined className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <GithubOutlined className="h-6 w-6" />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4 capitalize">{category}</h4>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item}>
                    <Link to="#" className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; 2024 Planify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
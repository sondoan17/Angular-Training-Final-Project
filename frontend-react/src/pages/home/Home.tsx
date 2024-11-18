import { Layout } from 'antd';
import Header from '../../components/HomeComponents/Header';
import Hero from '../../components/HomeComponents/Hero';
import Features from '../../components/HomeComponents/Features';
import FeatureSections from '../../components/HomeComponents/FeatureSections';
import Testimonials from '../../components/HomeComponents/Testimonials';
import Footer from '../../components/HomeComponents/Footer';

const Home = () => {
  return (
    <Layout className="min-h-screen font-sans bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <Header />
      <Layout.Content>
        <Hero />
        <Features />
        <FeatureSections />
        <Testimonials />
      </Layout.Content>
      <Footer />
    </Layout>
  );
};

export default Home;
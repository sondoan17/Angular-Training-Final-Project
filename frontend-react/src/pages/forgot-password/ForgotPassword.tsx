import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (values: { email: string }) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      message.success('Password reset link has been sent to your email');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      message.error('Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://res.cloudinary.com/db2tvcbza/image/upload/v1730869163/logo_sfhhhd.png"
            alt="logo"
            crossOrigin="anonymous"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Form
          name="forgot-password"
          onFinish={onSubmit}
          className="space-y-4 w-full"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email address"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700"
          >
            Send Reset Link →
          </Button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 
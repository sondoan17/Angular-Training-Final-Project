import { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../services/authApi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('Invalid token');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [token, navigate]);

  const onSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword({
        token: token!,
        newPassword: values.password
      }).unwrap();
      message.success('Password has been reset successfully');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      message.error('Failed to reset password');
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
            Reset Password
          </h2>
        </div>

        <Form
          name="reset-password"
          onFinish={onSubmit}
          className="space-y-4 w-full"
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: 'Please confirm your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
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
            Reset Password →
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

export default ResetPassword; 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginMutation, useLoginWithGoogleMutation } from '../../services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: string;
        ux_mode?: string;
      }) => void;
      renderButton: (
        element: HTMLElement | null,
        options: {
          type?: string;
          theme?: string;
          size?: string;
          text?: string;
          width?: number;
          logo_alignment?: string;
        }
      ) => void;
      cancel: () => void;
    };
  };
}

declare global {
  interface Window {
    google: Google;
  }
  var google: Google;
}

export {};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [loginWithGoogle] = useLoginWithGoogleMutation();

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window.google === 'undefined') {
        setTimeout(initializeGoogleSignIn, 100);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
        });

        const googleBtn = document.getElementById('googleBtn');
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 250,
            logo_alignment: 'center',
          });
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };

    initializeGoogleSignIn();

    return () => {
      if (typeof window.google !== 'undefined') {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const onSubmit = async (values: { username: string; password: string }) => {
    try {
      const response = await login(values).unwrap();
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.userId,
        username: response.username
      }));
      dispatch(setCredentials(response));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const result = await loginWithGoogle({ token: response.credential }).unwrap();
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.userId,
        username: result.username
      }));
      dispatch(setCredentials(result));
      message.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Google login failed');
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
            Log In
          </h2>
        </div>

        <Form
          name="login"
          onFinish={onSubmit}
          className="space-y-4 w-full"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700"
          >
            Log in →
          </Button>
        </Form>

        <Divider className="text-gray-500">Or Sign in with</Divider>

        <div className="mt-6 flex justify-center">
          <div id="googleBtn"></div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have account?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, message, Card, Spin, Avatar } from 'antd';
import { UserOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';
import moment from 'moment';
import { userService, type UserProfile } from '../../services/api/userService';

const Profile = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getCurrentUserProfile();
      setProfile(userData);
      
      // Set form values
      form.setFieldsValue({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        birthDate: userData.birthDate ? moment(userData.birthDate) : null,
        twitter: userData.socialMedia?.twitter,
        instagram: userData.socialMedia?.instagram,
        linkedin: userData.socialMedia?.linkedin,
        github: userData.socialMedia?.github
      });
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setIsSaving(true);
      await userService.updateUserProfile({
        name: values.name,
        email: values.email,
        birthDate: values.birthDate?.toDate(),
        socialMedia: {
          twitter: values.twitter,
          instagram: values.instagram,
          linkedin: values.linkedin,
          github: values.github
        }
      });
      message.success('Profile updated successfully');
      await loadUserProfile();
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          {/* Profile Header - Similar to Angular template */}
          <div className="flex items-center space-x-5 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <Avatar
              size={80}
              src={`https://ui-avatars.com/api/?name=${profile?.username}&background=random&size=80`}
              className="ring-4 ring-white dark:ring-gray-700"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile?.name || profile?.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{profile?.username}
              </p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-4"
          >
            {/* Form fields matching the Angular template structure */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
              
              <Form.Item
                label="Username"
                name="username"
              >
                <Input 
                  prefix={<UserOutlined />}
                  disabled 
                  className="bg-gray-50 dark:bg-gray-700"
                />
              </Form.Item>

              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please input your name' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                label="Birth Date"
                name="birthDate"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>

            <div className="border-t dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Social Media Links
              </h3>
              <div className="space-y-4">
                <Form.Item label="Twitter" name="twitter">
                  <Input prefix={<LinkOutlined />} />
                </Form.Item>

                <Form.Item label="Instagram" name="instagram">
                  <Input prefix={<LinkOutlined />} />
                </Form.Item>

                <Form.Item label="LinkedIn" name="linkedin">
                  <Input prefix={<LinkOutlined />} />
                </Form.Item>

                <Form.Item label="GitHub" name="github">
                  <Input prefix={<LinkOutlined />} />
                </Form.Item>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-gray-700">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 
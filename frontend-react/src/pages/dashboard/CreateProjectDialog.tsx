import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (projectData: { name: string; description: string }) => void;
}

const CreateProjectDialog = ({ open, onClose, onSubmit }: CreateProjectDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create New Project"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create
        </Button>,
      ]}
      className="dark:bg-gray-800"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter project description' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter project description"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectDialog; 
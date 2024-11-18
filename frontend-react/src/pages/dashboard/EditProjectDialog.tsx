import { Modal, Form, Input, Button } from 'antd';
import { useEffect, useState } from 'react';

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface EditProjectDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (projectData: { name: string; description: string }) => void;
}

const EditProjectDialog = ({ open, project, onClose, onSubmit }: EditProjectDialogProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project && open) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
      });
    }
  }, [project, open, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSubmit(values);
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
      title="Edit Project"
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
          Save Changes
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

export default EditProjectDialog; 
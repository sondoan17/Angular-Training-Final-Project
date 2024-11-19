import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

interface EditProjectDialogProps {
  open: boolean;
  project: {
    name: string;
    description: string;
  } | null;
  onClose: () => void;
  onSubmit: (values: { name: string; description: string }) => void;
}

const EditProjectDialog = ({ open, project, onClose, onSubmit }: EditProjectDialogProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (project && open) {
      form.setFieldsValue({
        name: project.name,
        description: project.description
      });
    }
  }, [project, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Edit Project"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Save"
      className="dark:bg-gray-800"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="name"
          label={<span className="dark:text-gray-300">Project Name</span>}
          rules={[{ required: true, message: 'Please enter project name' }]}
        >
          <Input className="dark:bg-gray-700 dark:text-gray-200" />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="dark:text-gray-300">Description</span>}
        >
          <Input.TextArea
            rows={4}
            className="dark:bg-gray-700 dark:text-gray-200"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProjectDialog;

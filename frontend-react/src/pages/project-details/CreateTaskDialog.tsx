import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { useState, useEffect } from 'react';
import { projectService } from '../../services/api/projectService';

interface CreateTaskDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskDialog = ({
  open,
  projectId,
  onClose,
  onTaskCreated,
}: CreateTaskDialogProps) => {
  const [form] = Form.useForm();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjectMembers();
    }
  }, [open, projectId]);

  const loadProjectMembers = async () => {
    try {
      const project = await projectService.getProjectDetails(projectId);
      setMembers(project.members);
    } catch (error) {
      console.error('Error loading project members:', error);
      message.error('Failed to load project members');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const taskData = {
        ...values,
        dueDate: values.dueDate?.toISOString(),
      };

      await projectService.createTask(projectId, taskData);
      message.success('Task created successfully');
      form.resetFields();
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Task"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Create"
      confirmLoading={loading}
      className="dark:bg-gray-800"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="title"
          label={<span className="dark:text-gray-300">Title</span>}
          rules={[{ required: true, message: 'Please enter task title' }]}
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

        <Form.Item
          name="assignedTo"
          label={<span className="dark:text-gray-300">Assign To</span>}
        >
          <Select
            placeholder="Select team member"
            className="dark:bg-gray-700"
            options={members.map((member) => ({
              label: member.username,
              value: member._id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label={<span className="dark:text-gray-300">Priority</span>}
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select
            className="dark:bg-gray-700"
            options={[
              { label: 'Low', value: 'Low' },
              { label: 'Medium', value: 'Medium' },
              { label: 'High', value: 'High' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label={<span className="dark:text-gray-300">Due Date</span>}
        >
          <DatePicker
            className="w-full dark:bg-gray-700 dark:text-gray-200"
            showTime
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskDialog;

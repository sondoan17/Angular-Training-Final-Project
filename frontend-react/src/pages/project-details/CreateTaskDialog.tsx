import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { useState, useEffect } from "react";
import { projectService } from "../../services/api/projectService";
import { taskService } from "../../services/api/taskService";

interface CreateTaskDialogProps {
  open: boolean;
  projectId: string | undefined;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface Member {
  _id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
}

const CreateTaskDialog = ({
  open,
  projectId,
  onClose,
  onTaskCreated,
}: CreateTaskDialogProps) => {
  const [form] = Form.useForm();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjectMembers();
      form.resetFields();
    }
  }, [open, projectId, form]);

  const loadProjectMembers = async () => {
    if (!projectId) return;

    try {
      const project = await projectService.getProjectDetails(projectId);
      setMembers(project.members);
    } catch (error) {
      console.error("Error loading project members:", error);
      message.error("Failed to load project members");
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const values = await form.validateFields();

      const taskData = {
        ...values,
        status: "Not Started", // Default status
        type: values.type || "task", // Default type
        timeline: {
          start: values.startDate?.toISOString(),
          end: values.dueDate?.toISOString(),
        },
        assignedTo: Array.isArray(values.assignedTo) ? values.assignedTo : [values.assignedTo],
        priority: values.priority.toLowerCase() // Convert to lowercase to match backend enum
      };

      await taskService.createTask(projectId, taskData);
      message.success("Task created successfully");
      form.resetFields();
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Failed to create task");
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
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label={<span className="dark:text-gray-300">Title</span>}
          rules={[{ required: true, message: "Please enter task title" }]}
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
          name="type"
          label={<span className="dark:text-gray-300">Type</span>}
          initialValue="task"
        >
          <Select
            className="dark:bg-gray-700"
            options={[
              { label: "Task", value: "task" },
              { label: "Bug", value: "bug" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label={<span className="dark:text-gray-300">Assign To</span>}
        >
          <Select
            mode="multiple"
            placeholder="Select team members"
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
          rules={[{ required: true, message: "Please select priority" }]}
        >
          <Select
            className="dark:bg-gray-700"
            options={[
              { label: "None", value: "none" },
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Critical", value: "critical" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label={<span className="dark:text-gray-300">Start Date</span>}
        >
          <DatePicker
            className="w-full dark:bg-gray-700 dark:text-gray-200"
            showTime
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

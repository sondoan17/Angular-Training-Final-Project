import { Modal, Form, Select, List, Avatar, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { userService } from '../../services/api/userService';
import { projectService } from '../../services/api/projectService';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface ProjectMember {
  _id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface Project {
  _id: string;
  members: ProjectMember[];
}

interface ProjectMembersDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onMembersUpdated: () => void;
}

const ProjectMembersDialog = ({
  open,
  project,
  onClose,
  onMembersUpdated,
}: ProjectMembersDialogProps) => {
  if (!project) return null;

  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      const filteredUsers = response.filter(
        (user) => !project.members.some((member) => member._id === user._id)
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    try {
      const values = await form.validateFields();
      await projectService.addProjectMembers(project._id, values.members);
      message.success('Members added successfully');
      form.resetFields();
      onMembersUpdated();
    } catch (error) {
      console.error('Error adding members:', error);
      message.error('Failed to add members');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await projectService.removeProjectMember(project._id, memberId);
      message.success('Member removed successfully');
      onMembersUpdated();
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Failed to remove member');
    }
  };

  return (
    <Modal
      title="Project Members"
      open={open}
      onCancel={onClose}
      footer={null}
      className="dark:bg-gray-800"
    >
      <div className="space-y-6">
        <Form form={form} layout="vertical">
          <Form.Item
            name="members"
            label={<span className="dark:text-gray-300">Add Members</span>}
          >
            <Select
              mode="multiple"
              placeholder="Select users to add"
              loading={loading}
              className="dark:bg-gray-700"
              options={users.map((user) => ({
                label: user.username,
                value: user._id,
              }))}
            />
          </Form.Item>
          <Button type="primary" onClick={handleAddMembers}>
            Add Members
          </Button>
        </Form>

        <div>
          <h4 className="text-lg font-medium mb-4 dark:text-gray-300">
            Current Members
          </h4>
          <List
            dataSource={project.members}
            renderItem={(member: ProjectMember) => (
              <List.Item
                className="dark:border-gray-700"
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMember(member._id)}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={member.avatar} />}
                  title={
                    <span className="dark:text-gray-200">{member.username}</span>
                  }
                  description={
                    <span className="dark:text-gray-400">{member.email}</span>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProjectMembersDialog;

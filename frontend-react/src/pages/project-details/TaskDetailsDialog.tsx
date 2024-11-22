import { Modal, Spin, Button } from "antd";
import { useEffect, useState } from "react";
import { taskService } from "../../services/api/taskService";
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface TaskDetailsDialogProps {
  open: boolean;
  projectId: string | undefined;
  task: any;
  projectMembers: any[];
  onClose: () => void;
}

const TaskDetailsDialog = ({
  open,
  projectId,
  task,
  projectMembers,
  onClose,
}: TaskDetailsDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && projectId && task) {
      loadTaskDetails();
    }
  }, [open, projectId, task]);

  const loadTaskDetails = async () => {
    if (!projectId || !task._id) return;

    try {
      setIsLoading(true);
      const details = await taskService.getTaskDetails(projectId, task._id);
      setTaskDetails(details);
    } catch (error) {
      console.error("Error loading task details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "Not Started":
        return "bg-gray-500 text-gray-100";
      case "In Progress":
        return "bg-blue-500 text-gray-100";
      case "Stuck":
        return "bg-red-500 text-gray-100";
      case "Done":
        return "bg-green-500 text-gray-100";
      default:
        return "bg-gray-500 text-gray-100";
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "critical":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getAssignedMembers = () => {
    const currentTask = taskDetails || task;
    if (!currentTask || !currentTask.assignedTo) return [];

    return currentTask.assignedTo.map((member: any) => {
      if (typeof member === "object" && member !== null) {
        return member;
      }
      const projectMember = projectMembers.find((m: any) => m._id === member);
      return projectMember || { _id: member, username: "Unknown User" };
    });
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/projects/${projectId}/tasks/${task._id}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      closeIcon={null}
      styles={{
        body: {
          maxHeight: "80vh",
          overflow: "auto",
          padding: 0,
          backgroundColor: "transparent",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
        content: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
        wrapper: {
          backgroundColor: "transparent",
        },
      }}
      className="task-details-dialog"
    >
      <div className="w-full max-w-3xl mx-auto overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 z-50 flex items-center justify-center rounded-lg">
            <Spin size="large" />
          </div>
        ) : (
          <div className={isLoading ? "opacity-50" : ""}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                    {taskDetails?.title || task.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`${getStatusClass(
                        taskDetails?.status || task.status
                      )} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap`}
                    >
                      {taskDetails?.status || task.status}
                    </span>
                    <span
                      className={`${getPriorityClass(
                        taskDetails?.priority || task.priority
                      )} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap`}
                    >
                      {taskDetails?.priority || task.priority}
                    </span>
                  </div>
                </div>
                <Button
                  type="text"
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 -mt-2 -mr-2"
                  icon={<CloseOutlined />}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Description
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
                    {taskDetails?.description ||
                      task.description ||
                      "No description provided"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Assigned Members
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-col gap-2">
                    {getAssignedMembers().map((member: any) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${member.username}&background=random`}
                            alt={member.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                            {member.username}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Member
                        </span>
                      </div>
                    ))}
                    {getAssignedMembers().length === 0 && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm italic p-2 text-center">
                        No members assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
              <Button 
                onClick={onClose}
                className="text-gray-600 dark:text-gray-300"
              >
                Close
              </Button>
              <Button
                type="primary"
                onClick={handleViewFullDetails}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Full Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailsDialog;

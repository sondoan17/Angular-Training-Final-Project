import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Spin, Timeline, Input, Form, Dropdown } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { projectService } from "../../services/api/projectService";
import dayjs from "dayjs";

const REACTION_TYPES = ["👍", "👎", "😄", "🎉", "😕", "❤️"];

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  reactions: Array<{
    type: string;
    user: {
      _id: string;
      username: string;
    };
  }>;
  createdAt: string;
}

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [form] = Form.useForm();

  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    loadTaskDetails();
    loadComments();
  }, [projectId, taskId]);

  const loadTaskDetails = async () => {
    if (!projectId || !taskId) return;

    try {
      setIsLoading(true);
      const details = await projectService.getTaskDetails(projectId, taskId);
      setTaskDetails(details);
    } catch (error) {
      console.error("Error loading task details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!projectId || !taskId) return;

    try {
      setIsLoadingComments(true);
      const commentsData = await projectService.getTaskComments(
        projectId,
        taskId
      );
      setComments(commentsData);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
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

  const formatDate = (date: string) => {
    return dayjs(date).format("MMM D, YYYY");
  };

  const formatDateTime = (date: string) => {
    return dayjs(date).format("MMM D, YYYY h:mm A");
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !projectId || !taskId) return;

    try {
      setIsLoadingComments(true);
      const comment = await projectService.addTaskComment(projectId, taskId, {
        content: newComment.trim(),
      });

      setComments((prevComments) => [comment, ...prevComments]);
      setNewComment("");
      form.resetFields();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleReaction = async (commentId: string, type: string) => {
    if (!projectId || !taskId) return;

    try {
      // Optimistic update
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment._id !== commentId) return comment;

          const userId = localStorage.getItem("userId");
          const existingReaction = comment.reactions?.find(
            (r) => r.user._id === userId && r.type === type
          );

          let updatedReactions = [...(comment.reactions || [])];
          if (existingReaction) {
            updatedReactions = updatedReactions.filter(
              (r) => !(r.user._id === userId && r.type === type)
            );
          } else {
            updatedReactions.push({
              type,
              user: { _id: userId || "", username: "" },
            });
          }

          return {
            ...comment,
            reactions: updatedReactions,
          };
        });
      });

      // Make API call
      const updatedComment = await projectService.addCommentReaction(
        projectId,
        taskId,
        commentId,
        type
      );

      // Update with server response
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert on error by reloading comments
      loadComments();
    }
  };

  const getReactionCount = (comment: any, type: string): number => {
    return comment.reactions?.filter((r: any) => r.type === type).length || 0;
  };

  const hasUserReacted = (comment: any, type: string): boolean => {
    const userId = localStorage.getItem("userId");
    return (
      comment.reactions?.some(
        (r: any) => r.user._id === userId && r.type === type
      ) || false
    );
  };

  const getExistingReactionTypes = (comment: any): string[] => {
    if (!comment.reactions) return [];
    return Array.from(new Set(comment.reactions.map((r: any) => r.type)));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          Back to Project
        </Button>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Task Details */}
          <div className="lg:w-2/3 lg:flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              {/* Task Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {taskDetails?.title}
                  </h1>
                  <div className="flex gap-2">
                    <span
                      className={`${getStatusClass(
                        taskDetails?.status
                      )} px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                      {taskDetails?.status}
                    </span>
                    <span
                      className={`${getPriorityClass(
                        taskDetails?.priority
                      )} px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                      {taskDetails?.priority}
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-semibold">
                      {taskDetails?.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Timeline Info */}
                <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CalendarOutlined className="text-blue-500 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Start Date
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {taskDetails?.timeline?.start
                      ? formatDate(taskDetails.timeline.start)
                      : "Not set"}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CalendarOutlined className="text-green-500 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Due Date
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {taskDetails?.timeline?.end
                      ? formatDate(taskDetails.timeline.end)
                      : "Not set"}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FieldTimeOutlined className="text-purple-500 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Last Updated
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100">
                    {taskDetails?.updatedAt
                      ? formatDate(taskDetails.updatedAt)
                      : "Not available"}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {taskDetails?.description || "No description provided"}
                </p>
              </div>

              {/* Assigned Members Section */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Assigned Members
                </h2>
                <div className="space-y-3">
                  {taskDetails?.assignedTo?.map((member: any) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${member.username}&background=random`}
                          alt={member.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-gray-900 dark:text-gray-100">
                          {member.username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log Section */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Activity Log
                </h2>
                <Timeline
                  items={taskDetails?.activityLog?.map((activity: any) => ({
                    children: (
                      <div className="text-gray-600 dark:text-gray-300">
                        <p>{activity.action}</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                    ),
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Right column - Comments */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden lg:sticky lg:top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">💬</span>
                  Comments
                </h2>

                {/* Comment form */}
                <Form form={form} className="mb-6">
                  <Form.Item>
                    <Input.TextArea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment here..."
                      maxLength={1000}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Share your thoughts about this task
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {newComment.length}/1000
                      </span>
                    </div>
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={handleAddComment}
                    loading={isLoadingComments}
                    disabled={!newComment.trim()}
                    className="w-full"
                  >
                    Add Comment
                  </Button>
                </Form>

                {/* Comments list */}
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {(!comments || comments.length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      <span className="text-4xl mb-2">💭</span>
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}

                  {comments.map((comment: Comment) => (
                    <div
                      key={comment._id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 p-3 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${
                            comment.author?.username || "User"
                          }&background=random`}
                          alt={comment.author?.username || "User"}
                          className="w-10 h-10 rounded-full shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {comment.author?.username || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(comment.createdAt)}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Dropdown
                                menu={{
                                  items: REACTION_TYPES.map((type) => ({
                                    key: type,
                                    label: (
                                      <span
                                        className={
                                          hasUserReacted(comment, type)
                                            ? "text-blue-500"
                                            : ""
                                        }
                                      >
                                        {type}
                                      </span>
                                    ),
                                    onClick: () =>
                                      handleReaction(comment._id, type),
                                  })),
                                }}
                                trigger={["click"]}
                              >
                                <Button
                                  type="text"
                                  icon={<SmileOutlined />}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                />
                              </Dropdown>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {comment.content}
                          </p>
                          {getExistingReactionTypes(comment).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {getExistingReactionTypes(comment).map((type) => (
                                <button
                                  key={type}
                                  onClick={() =>
                                    handleReaction(comment._id, type)
                                  }
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                                    hasUserReacted(comment, type)
                                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                  } hover:bg-gray-200 dark:hover:bg-gray-600`}
                                >
                                  <span>{type}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {getReactionCount(comment, type)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

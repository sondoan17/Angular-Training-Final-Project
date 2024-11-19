import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Task } from "../../types/project.types";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (task: Task, newStatus: string) => Promise<void>;
  onAddTask: () => void;
  onTaskClick: (taskId: string) => void;
  isProjectCreator: boolean;
}

const STATUSES = [
  { id: 'Not Started', color: 'bg-gray-50 dark:bg-gray-900 border-t-4 border-gray-300 dark:border-gray-600' },
  { id: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/30 border-t-4 border-blue-400 dark:border-blue-500' },
  { id: 'Stuck', color: 'bg-red-50 dark:bg-red-900/30 border-t-4 border-red-400 dark:border-red-500' },
  { id: 'Done', color: 'bg-green-50 dark:bg-green-900/30 border-t-4 border-green-400 dark:border-green-500' }
];

const KanbanBoard = ({
  tasks,
  onTaskMove,
  onAddTask,
  onTaskClick,
  isProjectCreator,
}: KanbanBoardProps) => {
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-purple-600 text-white dark:bg-purple-700";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };
 

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination || !isProjectCreator) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
    if (task && destination.droppableId !== task.status) {
      try {
        if (onDragEnd.isMoving) return;
        onDragEnd.isMoving = true;
        
        await onTaskMove(task, destination.droppableId);
      } catch (error) {
        console.error('Error in onDragEnd:', error);
      } finally {
        onDragEnd.isMoving = false;
      }
    }
  };

  onDragEnd.isMoving = false;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold dark:text-gray-200">Tasks</h3>
        {isProjectCreator && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddTask}
            className="bg-blue-600"
          >
            Add Task
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUSES.map((status) => (
            <div key={status.id} className={`p-4 rounded-lg shadow ${status.color}`}>
              <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                {status.id} ({getTasksByStatus(status.id).length})
              </h4>
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 rounded-lg min-h-[200px] `}
                  >
                    {getTasksByStatus(status.id).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                        isDragDisabled={!isProjectCreator}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card
                              className={`mb-4 cursor-pointer ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              } dark:bg-gray-700`}
                              onClick={() => onTaskClick(task._id)}
                            >
                              <div className="space-y-2">
                                <h5 className="font-medium dark:text-gray-200">
                                  {task.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {task.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

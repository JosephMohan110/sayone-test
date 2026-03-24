import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onDelete, onEdit, onComplete }) => {
  if (!tasks.length) {
    return <p>No tasks yet. Create one!</p>;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};

export default TaskList;
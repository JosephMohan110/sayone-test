import React from 'react';

const TaskItem = ({ task, onDelete, onEdit, onComplete }) => {
  const priorityClass = `priority-${task.priority}`;

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`priority-badge ${priorityClass}`}>{task.priority}</span>
      </div>
      <p className="category">Category: {task.category}</p>
      {task.description && <p>{task.description}</p>}
      {task.due_date && <p className="due">Due: {task.due_date}</p>}
      <div className="task-actions">
        {!task.completed && (
          <button onClick={() => onComplete(task.id)}>✓ Complete</button>
        )}
        <button onClick={() => onEdit(task)}>✎ Edit</button>
        <button onClick={() => onDelete(task.id)}>🗑 Delete</button>
      </div>
    </div>
  );
};

export default TaskItem;
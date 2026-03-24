import React from 'react';

const TaskItem = ({ task, onDelete, onEdit, onComplete, onDragStart, onDragOver, onDrop }) => {
  const priorityClass = `priority-${task.priority}`;

  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days remaining`;
  };

  const daysRemainingText = calculateDaysRemaining(task.due_date);
  const isDueSoon = task.due_date && daysRemainingText === '1 days remaining';
  const isOverdue = task.due_date && daysRemainingText === 'Overdue';

  return (
    <div
      className={`task-item ${task.completed ? 'completed' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDrop={(e) => onDrop(e, task.id)}
      style={{
        border: isOverdue ? '2px solid red' : isDueSoon ? '2px solid orange' : '1px solid #ccc',
      }}
    >
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`priority-badge ${priorityClass}`}>{task.priority}</span>
      </div>
      <p className="category">Category: {task.category}</p>
      {task.image_url && (
        <div className="image-preview" style={{ marginBottom: '8px' }}>
          <img src={task.image_url} alt={task.title} style={{ maxWidth: '100%', maxHeight: '200px' }} />
        </div>
      )}
      {task.description && <p>{task.description}</p>}
      {task.due_date && <p className="due">Due: {task.due_date}</p>}
      {task.due_date && (
        <p className="days-remaining" style={{ color: isOverdue ? 'red' : isDueSoon ? 'orange' : 'inherit' }}>
          {daysRemainingText}
        </p>
      )}
      <div className="task-actions">
        {!task.completed && (
          <button className="complete" onClick={() => onComplete(task.id)}>✓ Complete</button>
        )}
        <button className="edit" onClick={() => onEdit(task)}>✎ Edit</button>
        <button className="delete" onClick={() => onDelete(task.id)}>🗑 Delete</button>
      </div>
    </div>
  );
};

export default TaskItem;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { fetchTasks, createTask, updateTask, deleteTask, completeTask, reorderTasks } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, completed: 0, percent: 0 });
  const [error, setError] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (tasks.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const percent = total ? (completed / total * 100).toFixed(1) : 0;

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let dueSoon = 0;
      let overdue = 0;

      tasks.forEach((t) => {
        if (t.completed || !t.due_date) return;

        const [year, month, day] = t.due_date.split('-').map(Number);
        if (!year || !month || !day) return;

        const dueDate = new Date(year, month - 1, day);
        const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        const diffDays = Math.floor((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdue += 1;
        } else if (diffDays === 1) {
          dueSoon += 1;
        }
      });

      setSummary({ total, completed, percent, dueSoon, overdue });
    } else {
      setSummary({ total: 0, completed: 0, percent: 0, dueSoon: 0, overdue: 0 });
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Fetching tasks...');
      const response = await fetchTasks();
      console.log('Tasks loaded:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(`Failed to load tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (taskData) => {
    try {
      setError(null);
      console.log('Creating task:', taskData);
      const response = await createTask(taskData);
      console.log('Task created:', response.data);
      setTasks([response.data, ...tasks]);
    } catch (error) {
      console.error('Error creating task:', error);
      const detail = error.response?.data?.detail || error.response?.data || error.message;
      setError(`Failed to create task: ${detail}`);
    }
  };

  const handleUpdate = async (id, taskData) => {
    try {
      setError(null);
      console.log('Updating task:', id, taskData);
      const response = await updateTask(id, taskData);
      console.log('Task updated:', response.data);
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      const detail = error.response?.data?.detail || error.response?.data || error.message;
      setError(`Failed to update task: ${detail}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      console.log('Deleting task:', id);
      await deleteTask(id);
      console.log('Task deleted:', id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      const detail = error.response?.data?.detail || error.response?.data || error.message;
      setError(`Failed to delete task: ${detail}`);
    }
  };

  const handleComplete = async (id) => {
    try {
      setError(null);
      console.log('Completing task:', id);
      await completeTask(id);
      console.log('Task completed:', id);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
    } catch (error) {
      console.error('Error completing task:', error);
      const detail = error.response?.data?.detail || error.response?.data || error.message;
      setError(`Failed to complete task: ${detail}`);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetTaskId) => {
    e.preventDefault();

    if (draggedTaskId === null || draggedTaskId === targetTaskId) return;

    const reordered = [...tasks];
    const dragIndex = reordered.findIndex((task) => task.id === draggedTaskId);
    const targetIndex = reordered.findIndex((task) => task.id === targetTaskId);

    if (dragIndex < 0 || targetIndex < 0) return;

    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setTasks(reordered);
    setDraggedTaskId(null);

    try {
      // Persist the new order on server
      await reorderTasks(reordered.map((task) => task.id));
    } catch (error) {
      console.error('Error reordering tasks:', error);
      setError('Failed to reorder tasks, please reload.');
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const visibleTasks = tasks;

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Project: Smart Task Tracker</h1>
          <h2 className="project-heading">Manage your tasks</h2>
          {user && <p className="welcome-text">Welcome, {user.username || user.sub}!</p>}
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
{error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      <div className="summary">
        <p>Total tasks: {summary.total}</p>
        <p>Completed: {summary.completed}</p>
        <p>Completion: {summary.percent}%</p>
        <p style={{ color: summary.dueSoon > 0 ? 'orange' : 'inherit' }}>
          Due in 1 day: {summary.dueSoon || 0}
        </p>
        <p style={{ color: summary.overdue > 0 ? 'red' : 'inherit' }}>
          Overdue: {summary.overdue || 0}
        </p>
      </div>

      <TaskForm
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editingTask={editingTask}
        onCancel={cancelEdit}
      />
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList
          tasks={visibleTasks}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onComplete={handleComplete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
};

export default Dashboard;

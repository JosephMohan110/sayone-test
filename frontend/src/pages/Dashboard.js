import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { fetchTasks, createTask, updateTask, deleteTask, completeTask } from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, completed: 0, percent: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (tasks.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const percent = total ? (completed / total * 100).toFixed(1) : 0;
      setSummary({ total, completed, percent });
    } else {
      setSummary({ total: 0, completed: 0, percent: 0 });
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
      setError(`Failed to create task: ${error.message}`);
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
      setError(`Failed to update task: ${error.message}`);
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
      setError(`Failed to delete task: ${error.message}`);
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
      setError(`Failed to complete task: ${error.message}`);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="container">
      <h1>Smart Task Tracker</h1>
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
          Error: {error}
        </div>
      )}
      <div className="summary">
        <p>Total tasks: {summary.total}</p>
        <p>Completed: {summary.completed}</p>
        <p>Completion: {summary.percent}%</p>
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
          tasks={tasks}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
// frontend/src/components/TaskForm.js
import React, { useState, useEffect } from 'react';
import { suggestPriority } from '../services/api';

const TaskForm = ({ onCreate, onUpdate, editingTask, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [suggestedPriority, setSuggestedPriority] = useState(null);

  useEffect(() => {
    if (editingTask) {
      console.log('Editing task:', editingTask);
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || 'other');
      setImageUrl(editingTask.image_url || '');
      setDueDate(editingTask.due_date || '');
      setPriority(editingTask.priority || 'medium');
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('other');
    setImageUrl('');
    setDueDate('');
    setPriority('medium');
    setSuggestedPriority(null);
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-suggest priority when typing title
    if (newTitle.length > 3) {
      try {
        const res = await suggestPriority({ title: newTitle });
        setSuggestedPriority(res.data.priority);
      } catch (error) {
        console.error('Error suggesting priority:', error);
      }
    } else {
      setSuggestedPriority(null);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const chosenCategory = category?.trim() ? category.trim() : 'other';

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      category: chosenCategory,
      due_date: dueDate || null,
      priority: priority,
      image_url: imageUrl || '',
      completed: editingTask ? editingTask.completed : false,
    };
    
    console.log('Submitting task data:', taskData);
    
    if (editingTask) {
      // Make sure we have the correct ID
      console.log('Updating task with ID:', editingTask.id);
      onUpdate(editingTask.id, taskData);
    } else {
      onCreate(taskData);
    }
    
    if (!editingTask) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
      <div>
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          required
          placeholder="Enter task title"
        />
        {suggestedPriority && (
          <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
            Suggested priority: <strong>{suggestedPriority}</strong>
          </small>
        )}
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows="3"
        />
      </div>
      <div>
        <label>Category</label>
        <input
          list="category-options"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Work, Personal, Shopping, Other, etc."
          autoComplete="off"
        />
        <datalist id="category-options">
          <option value="work" />
          <option value="personal" />
          <option value="shopping" />
          <option value="other" />
          <option value="family" />
          <option value="health" />
        </datalist>
      </div>
      <div>
        <label>Image (drag & drop or file select)</label>
        <div
          className="image-drop-zone"
          onDrop={handleDropImage}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '2px dashed #aaa',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          <p>Drop an image here, or click to select</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ marginTop: '8px' }}
          />
        </div>
        {imageUrl && (
          <div>
            <p>Preview:</p>
            <img src={imageUrl} alt="Task" style={{ maxWidth: '100%', maxHeight: '180px' }} />
          </div>
        )}
      </div>
      <div>
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</button>
        {editingTask && (
          <button type="button" onClick={() => {
            onCancel();
            resetForm();
          }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
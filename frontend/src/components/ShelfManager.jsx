import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './ShelfManager.css';

const ShelfManager = ({ shelves, onShelvesChange, onClose }) => {
  const [newShelfName, setNewShelfName] = useState('');
  const [editingShelfId, setEditingShelfId] = useState(null);
  const [editShelfName, setEditShelfName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await ApiService.createShelf(newShelfName);
      onShelvesChange([...shelves, response.data]);
      setNewShelfName('');
    } catch (err) {
      setError(err.message || 'Failed to create shelf');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shelf? Books will not be deleted.')) return;
    
    try {
      await ApiService.deleteShelf(id);
      onShelvesChange(shelves.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete shelf');
    }
  };

  const handleUpdate = async (id) => {
    if (!editShelfName.trim()) return;

    try {
      await ApiService.updateShelf(id, editShelfName);
      onShelvesChange(shelves.map(s => s.id === id ? { ...s, name: editShelfName } : s));
      setEditingShelfId(null);
    } catch (err) {
      setError(err.message || 'Failed to update shelf');
    }
  };

  return (
    <div className="shelf-manager-overlay" onClick={onClose}>
      <div className="shelf-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Shelves</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="shelf-error">{error}</div>}

        <form className="create-shelf-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="New shelf name..."
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newShelfName.trim()}>
            {loading ? '...' : 'Create'}
          </button>
        </form>

        <div className="shelves-list">
          {shelves.length === 0 ? (
            <p className="no-shelves">You haven't created any shelves yet.</p>
          ) : (
            shelves.map(shelf => (
              <div key={shelf.id} className="shelf-item">
                {editingShelfId === shelf.id ? (
                  <div className="edit-shelf-mode">
                    <input
                      type="text"
                      value={editShelfName}
                      onChange={(e) => setEditShelfName(e.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button onClick={() => handleUpdate(shelf.id)}>Save</button>
                      <button className="cancel" onClick={() => setEditingShelfId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="shelf-name">📚 {shelf.name}</span>
                    <div className="shelf-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => {
                          setEditingShelfId(shelf.id);
                          setEditShelfName(shelf.name);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(shelf.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShelfManager;

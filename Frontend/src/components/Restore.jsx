import { useState } from 'react';
import axios from 'axios';

export default function BackupRestore() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); 

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const confirmRestore = () => {
    if (!selectedFile) {
      setMessage('Please select a backup file first.');
      setTimestamp('');
      return;
    }
    setShowModal(true); 
  };

  const handleRestore = async () => {
    setShowModal(false);
    setLoading(true);
    setMessage('');
    setTimestamp('');

    const formData = new FormData();
    formData.append('backup_file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/restore/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.detail);
      setTimestamp(response.data.timestamp || '');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Restore failed.');
      setTimestamp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Restore Backup</h3>

      <input
        type="file"
        onChange={handleFileChange}
        accept=".tar.gz"
        disabled={loading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={confirmRestore}
        disabled={loading}
        className={`w-full text-white font-bold py-2 px-4 rounded ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Restoring...' : 'Upload & Restore'}
      </button>

      {message && (
        <div className="text-sm text-gray-700">
          <p>{message}</p>
          {timestamp && <p className="text-gray-500">Timestamp: {timestamp}</p>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Confirm Restore</h4>
            <p className="text-sm text-gray-600">
              Are you sure you want to restore this backup? This action will overwrite existing data.
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

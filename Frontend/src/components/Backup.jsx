import { useState } from 'react';
import axios from 'axios';

export default function Backup() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const handleBackupClick = async () => {
    setShowModal(false);
    setLoading(true);
    setMessage('');
    setTimestamp('');

    try {
      const response = await axios.get('http://localhost:8000/api/backup/', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.tar.gz');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('Backup downloaded successfully.');
      setTimestamp(new Date().toLocaleString());
    } catch (error) {
      setMessage('Failed to download backup.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDownload = () => {
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Download Backup</h3>

      <button
        onClick={confirmDownload}
        disabled={loading}
        className={`w-full text-white font-bold py-2 px-4 rounded ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Downloading...' : 'Download Backup'}
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
            <h4 className="text-lg font-semibold text-gray-800">Confirm Backup</h4>
            <p className="text-sm text-gray-600">
              Are you sure you want to download the current system backup?
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBackupClick}
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

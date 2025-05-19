import { useState, useEffect } from 'react';
import axios from 'axios';
import membersIcon from '../resources/icons/members.png';
import usersIcon from '../resources/icons/users.png';
import auditIcon from '../resources/icons/dashB.png';
import loansIcon from '../resources/icons/loan.png';
import backupIcon from '../resources/icons/backup.png';
import restoreIcon from '../resources/icons/restore.png';
import AuditLogs from './Auditlogs';

export default function Dashboard() {
  // State variables for user, member, loan counts, audit logs, and timestamps
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalLoans, setTotalLoans] = useState(0);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [lastBackupTime, setLastBackupTime] = useState('');
  const [lastRestoreTime, setLastRestoreTime] = useState('');

  // Fetch all necessary data when the component is mounted
  useEffect(() => {
    fetchUsers();
    fetchMembers();
    fetchLoans();
    fetchLastBackupTime();
    fetchLastRestoreTime();
  }, []);

  // Fetch total users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/');
      setTotalUsers(response.data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch total members from API
  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/members/');
      setTotalMembers(response.data.length);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Fetch total loans from API
  const fetchLoans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/loans/');
      setTotalLoans(response.data.length);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  // Fetch last backup timestamp from API and format it
  const fetchLastBackupTime = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/backup/last/');
      if (response.data.last_backup) {
        const date = new Date(response.data.last_backup);
        setLastBackupTime(date.toLocaleString());
      } else {
        setLastBackupTime('No backups yet');
      }
    } catch (error) {
      console.error('Error fetching last backup time:', error);
      setLastBackupTime('Unavailable');
    }
  };

  // Fetch last restore timestamp from API and format it
  const fetchLastRestoreTime = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/restore/last/');
      if (response.data.last_restore_timestamp) {
        const date = new Date(response.data.last_restore_timestamp);
        setLastRestoreTime(date.toLocaleString());
      } else {
        setLastRestoreTime('No restores yet');
      }
    } catch (error) {
      console.error('Error fetching last restore time:', error);
      setLastRestoreTime('Unavailable');
    }
  };

  // Toggle audit logs modal; fetch logs if not already shown
  const handleAuditLogsClick = async () => {
    if (showAuditLogs) {
      setShowAuditLogs(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/auditlogs/');
      setAuditLogs(response.data);
      setShowAuditLogs(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Dashboard Title */}
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* First Row: Audit, Users, Members, Loans */}
      <div className="grid grid-cols-4 justify-items-center gap-4">
        {/* Audit Trails Card - clickable */}
        <div
          className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48 cursor-pointer"
          onClick={handleAuditLogsClick}
        >
          <img src={auditIcon} alt="Audit Trails" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-2">Audit Trails</p>
        </div>

        {/* Users Card */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48">
          <img src={usersIcon} alt="Users" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-1">Users</p>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </div>

        {/* Members Card */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48">
          <img src={membersIcon} alt="Members" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-1">Members</p>
          <p className="text-4xl font-bold">{totalMembers}</p>
        </div>

        {/* Loans Card */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48">
          <img src={loansIcon} alt="Loans" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-1">Loans</p>
          <p className="text-4xl font-bold">{totalLoans}</p>
        </div>
      </div>

      {/* Second Row: Backup and Restore info */}
      <div className="grid grid-cols-4 justify-items-center gap-4 mt-4">
        <div className="w-48 h-48"></div> {/* Placeholder for alignment */}

        {/* Backup Card */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48">
          <img src={backupIcon} alt="Backup" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-1">Backup</p>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {lastBackupTime}
          </p>
        </div>

        {/* Restore Card */}
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md flex flex-col items-center justify-center p-4 w-48 h-48">
          <img src={restoreIcon} alt="Restore" className="w-16 h-16 mb-2" />
          <p className="text-gray-600 text-sm font-bold mb-1">Restore</p>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {lastRestoreTime}
          </p>
        </div>

        <div className="w-48 h-48"></div> {/* Placeholder for alignment */}
      </div>

      {/* Conditional rendering of Audit Logs modal */}
      {showAuditLogs && (
        <AuditLogs logs={auditLogs} onClose={() => setShowAuditLogs(false)} />
      )}
    </div>
  );
}

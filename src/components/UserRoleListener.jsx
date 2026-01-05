import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // ✅ Only AuthContext
import socket from '../socket';

const UserRoleListener = () => {
  const { user, updateUserRole } = useAuth();

  useEffect(() => {
    if (!user || !user._id) return;

    const joinRoom = () => {
      if (socket.connected) {
        console.log(`🔌 Joining Room: ${user._id}`);
        socket.emit('join_room', user._id);
      }
    };

    if (socket.connected) joinRoom();
    socket.on('connect', joinRoom);

    const handleRoleUpdate = (data) => {
      if (user.role !== data.role) {
        updateUserRole(data.role);
        alert(data.message || `Your role changed to ${data.role}`);
      }
    };

    socket.on('role_updated', handleRoleUpdate);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('role_updated', handleRoleUpdate);
    };
  }, [user, updateUserRole]);

  return null;
};

export default UserRoleListener;

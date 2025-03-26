import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (session) {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setFormData(data);
        });
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm('Are you sure you want to update your profile?');
  
    if (confirmUpdate) {
      const sanitizedData = {
        ...formData,
        chessLevel: formData.chessLevel ? parseInt(formData.chessLevel, 10) : null, // Ensure it's an integer or null
      };
  
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sanitizedData),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.error}`);
      }
    }
  };
  
  

  if (!session) {
    return <p>Please <a href="/auth">login or register</a> to access your dashboard.</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} disabled={!editing} />
        </div>
        <div>
          <label>Chess Level:</label>
          <input type="number" name="chessLevel" value={formData.chessLevel || ''} onChange={handleChange} disabled={!editing} />
        </div>
        <div>
          <label>Bio:</label>
          <textarea name="bio" value={formData.bio || ''} onChange={handleChange} disabled={!editing} />
        </div>
        <div>
          <label>Profile Picture URL:</label>
          <input type="text" name="profilePic" value={formData.profilePic || ''} onChange={handleChange} disabled={!editing} />
        </div>
        <div>
          <label>Preferences:</label>
          <input type="text" name="preferences" value={formData.preferences || ''} onChange={handleChange} disabled={!editing} />
        </div>

        <button type="button" onClick={() => setEditing(true)} disabled={editing} style={{ marginRight: '10px' }}>
          Edit Profile
        </button>

        <button type="submit" disabled={!editing} style={{ backgroundColor: editing ? '#007bff' : '#ccc', color: 'white' }}>
          Confirm
        </button>
      </form>
    </div>
  );
}

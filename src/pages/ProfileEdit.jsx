import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import fetchWithMiddleware from '../utils/fetchMiddleware';
import '../style/profile.css';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const ProfileEdit = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', weight: '', height: '', age: '', gender: '' });
  const [avatar, setAvatar] = useState(null); // legacy base64 or server path
  const [avatarFile, setAvatarFile] = useState(null); // File object for upload
  const [avatarPreview, setAvatarPreview] = useState(null); // preview URL or server path
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = userId || sessionStorage.getItem('userId') || 1;
    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const data = await fetchWithMiddleware(`/api/users/${id}`, { method: 'GET' });
        if (data.success && data.user) {
          const u = data.user;
          setForm({ username: u.username || '', email: u.email || '', password: '', weight: u.weight || '', height: u.height || '', age: u.age || '', gender: u.gender || '' });
          sessionStorage.setItem('userName', u.username || '');
          sessionStorage.setItem('userEmail', u.email || '');
          sessionStorage.setItem('userWeight', u.weight || '');
          sessionStorage.setItem('userHeight', u.height || '');
          // prefer server profile_image, fallback to sessionStorage
          const serverAvatar = u.profile_image || sessionStorage.getItem('userAvatar');
          if (serverAvatar) {
            sessionStorage.setItem('userAvatar', serverAvatar);
            setAvatarPreview(serverAvatar);
            setAvatar(null);
            setAvatarFile(null);
          }
        } else {
          setMessage('Unable to load profile');
        }
      } catch (err) {
        setMessage('Network error while loading');
        console.debug('ProfileEdit load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
      try {
        const id = userId || sessionStorage.getItem('userId') || 1;
        // If we have a file, send multipart/form-data using FormData
        let d;
          if (avatarFile) {
            const formData = new FormData();
          formData.append('username', form.username || '');
          formData.append('email', form.email || '');
          formData.append('height', Number(form.height || 0));
          formData.append('weight', Number(form.weight || 0));
          formData.append('age', Number(form.age || 0));
          formData.append('gender', form.gender || 'other');
            if (form.password) formData.append('password', form.password);
          formData.append('avatar', avatarFile, avatarFile.name);

          // For multipart uploads include Authorization header but do NOT set Content-Type (browser sets the boundary)
          const token = sessionStorage.getItem('authToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = API_BASE ? `${API_BASE}/api/users/${id}` : `/api/users/${id}`;
            const res = await fetch(endpoint, { method: 'POST', headers, body: formData });
            d = await res.json();
        } else {
          // No file — submit fields only as JSON
          const payload = {
            username: form.username || undefined,
            email: form.email || undefined,
            height: Number(form.height || 0),
            weight: Number(form.weight || 0),
            age: Number(form.age || 0),
            gender: form.gender || 'other'
          };
          if (form.password) payload.password = form.password;
            d = await fetchWithMiddleware(`/api/users/${id}`, { method: 'POST', body: JSON.stringify(payload) });
        }

        // `d` is the parsed JSON response
      if (d.success) {
        if (d.profile_image) {
          sessionStorage.setItem('userAvatar', d.profile_image);
          setAvatarPreview(d.profile_image);
          setAvatarFile(null);
        } else if (avatarPreview) {
          sessionStorage.setItem('userAvatar', avatarPreview);
        }
        sessionStorage.setItem('userWeight', form.weight);
        sessionStorage.setItem('userHeight', form.height);
          if (form.age) sessionStorage.setItem('userAge', form.age);
          if (form.gender) sessionStorage.setItem('userGender', form.gender);
        setMessage('Profile updated successfully');
        setTimeout(() => navigate('/profile'), 900);
      } else {
        setMessage(d.message || 'Save failed');
      }
    } catch (e) {
      setMessage('Network error saving profile');
    } finally { setLoading(false); }
  };

  const saveAvatarToSession = (file, preview) => {
    if (!file && !preview) {
      sessionStorage.removeItem('userAvatar');
      setAvatar(null);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      if (file) setAvatarFile(file);
      if (preview) {
        sessionStorage.setItem('userAvatar', preview);
        setAvatarPreview(preview);
      }
    }
  };

  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          // set preview and file for upload
          saveAvatarToSession(file, ev.target.result);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        return;
      }
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => saveAvatarToSession(f, ev.target.result);
    reader.readAsDataURL(f);
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-upload" onPaste={handlePaste}>
            <img src={avatarPreview || avatar || sessionStorage.getItem('userAvatar') || '/avatar.png'} alt="avatar" className="profile-avatar" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, color: '#9fb4c9' }}>Paste an image here or choose a file</div>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {avatar && <button className="btn btn-ghost" onClick={() => saveAvatarToSession(null)}>Remove Avatar</button>}
            </div>
          </div>
          <div className="profile-meta">
            <h2 className="profile-name">Edit Profile</h2>
            <div className="profile-email">Update your personal details</div>
          </div>
        </div>

        <div className="profile-body">
          <div style={{ flex: 1 }}>
            <label className="form-label">Username</label>
            <input className="form-input" name="username" value={form.username} onChange={handleChange} />

            <label className="form-label">Email</label>
            <input className="form-input" name="email" value={form.email} onChange={handleChange} />

            <label className="form-label">Password (leave blank to keep current)</label>
            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} />

            <label className="form-label">Weight (kg)</label>
            <input className="form-input" name="weight" type="number" value={form.weight} onChange={handleChange} />

            <label className="form-label">Height (cm)</label>
            <input className="form-input" name="height" type="number" value={form.height} onChange={handleChange} />

            <label className="form-label">Age</label>
            <input className="form-input" name="age" type="number" value={form.age} onChange={handleChange} />

            <label className="form-label">Gender</label>
            <select className="form-input" name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>Save</button>
              <button className="btn btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
            </div>

            {message && <div style={{ marginTop: 10 }}>{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;

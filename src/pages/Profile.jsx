import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import fetchWithMiddleware from '../utils/fetchMiddleware';
import '../style/profile.css';

const Profile = () => {
	const { userId, logout } = useAuth();
	const navigate = useNavigate();
	const [user, setUser] = useState({
		username: sessionStorage.getItem('userName') || '',
		email: sessionStorage.getItem('userEmail') || '',
		age: sessionStorage.getItem('userAge') || '',
		gender: sessionStorage.getItem('userGender') || '',
		weight: sessionStorage.getItem('userWeight') || '',
		height: sessionStorage.getItem('userHeight') || ''
	});

	useEffect(() => {
		let cancelled = false;
		const loadUser = async () => {
			const id = userId || sessionStorage.getItem('userId');
			if (!id) return;
			try {
				const res = await fetchWithMiddleware(`/api/users/${id}`, { method: 'GET' });
				if (res && res.success && res.user && !cancelled) {
					const u = res.user;
					const updated = {
						username: u.username || '',
						email: u.email || '',
						age: u.age ?? '',
						gender: u.gender || '',
						weight: u.weight ?? '',
						height: u.height ?? ''
					};
					setUser(updated);
					try {
						sessionStorage.setItem('userName', updated.username);
						sessionStorage.setItem('userEmail', updated.email);
						if (updated.weight) sessionStorage.setItem('userWeight', updated.weight);
						if (updated.height) sessionStorage.setItem('userHeight', updated.height);
						if (updated.age) sessionStorage.setItem('userAge', updated.age);
						if (updated.gender) sessionStorage.setItem('userGender', updated.gender);
					} catch (e) {
						// ignore sessionStorage errors
					}
				}
			} catch (err) {
				console.debug('Failed to load profile:', err);
			}
		};
		loadUser();
		return () => { cancelled = true; };
	}, [userId]);

	return (
		<div className="profile-page">
			<div className="profile-card">
				<div className="profile-header">
					<img src={sessionStorage.getItem('userAvatar') || '/defaultprofile.jpg'} alt="avatar" className="profile-avatar" />
					<div className="profile-meta">
						<h2 className="profile-name">{user.username || `User`}</h2>
						<div className="profile-email">{user.email || 'you@example.com'}</div>
					</div>
				</div>

				<div className="profile-body">
					<div className="profile-stats">
						<div className="stat">
							<div className="stat-label">Weight</div>
							<div className="stat-value">{user.weight || '—'} kg</div>
						</div>

						<div className="stat">
							<div className="stat-label">Height</div>
							<div className="stat-value">{user.height || '—'} cm</div>
						</div>

						<div className="stat">
							<div className="stat-label">Age</div>
							<div className="stat-value">{user.age || '—'}</div>
						</div>

						<div className="stat">
							<div className="stat-label">Gender</div>
							<div className="stat-value">{user.gender || '—'}</div>
						</div>
					</div>

					<div className="profile-actions">
						<button className="btn btn-primary" onClick={() => navigate('/profile/edit')}>Edit Profile</button>
						<button className="btn btn-ghost" onClick={() => logout()}>Logout</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;

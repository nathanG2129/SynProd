import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../../services/api';
import { User } from '../../../types/auth';
import { useAuth } from '../../../contexts/AuthContext';

type SortKey = 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'emailVerified';

export function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const canView = user?.role === 'ADMIN';

  useEffect(() => {
    if (!canView) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await userAPI.getAllUsers();
        setUsers(res.data);
      } catch (e: any) {
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [canView]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? users.filter(u =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.role.toLowerCase().includes(term)
        )
      : users;

    const sorted = [...list].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      switch (sortBy) {
        case 'firstName':
          aVal = a.firstName.toLowerCase();
          bVal = b.firstName.toLowerCase();
          break;
        case 'lastName':
          aVal = a.lastName.toLowerCase();
          bVal = b.lastName.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'emailVerified':
          aVal = a.emailVerified ? 1 : 0;
          bVal = b.emailVerified ? 1 : 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, search, sortBy, sortOrder]);

  const headerCell = (label: string, key: SortKey) => (
    <th
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', textAlign: 'left' }}
      onClick={() => {
        if (sortBy === key) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(key);
          setSortOrder('asc');
        }
      }}
    >
      <span>{label}</span>{' '}
      {sortBy === key ? (
        <span style={{ color: '#91b029' }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
      ) : (
        <span style={{ color: '#cbd5e1' }}>↕</span>
      )}
    </th>
  );

  if (!canView) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Access Denied</h1>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Admins only</h3>
          <p style={{ color: '#64748b' }}>You need Admin privileges to view users.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Loading users...</p>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #91b029',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage system users</p>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#445c3c' }}>Users ({filtered.length})</h3>
          <input
            type="text"
            placeholder="Search name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 12px', border: '2px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', minWidth: '260px'
            }}
          />
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)' }}>
                {headerCell('First Name', 'firstName')}
                {headerCell('Last Name', 'lastName')}
                {headerCell('Email', 'email')}
                {headerCell('Role', 'role')}
                {headerCell('Verified?', 'emailVerified')}
                {headerCell('Created', 'createdAt')}
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={u.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{u.firstName}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{u.lastName}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>
                    <span className={`verification-badge ${u.emailVerified ? 'verified' : 'unverified'}`}>
                      {u.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Link 
                      to={`/dashboard/users/${u.id}/edit`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                      </svg>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



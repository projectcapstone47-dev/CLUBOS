'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationsApi, membershipsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  isMember: boolean;
  isCreator: boolean;
  memberCount: number;
  createdBy: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await organizationsApi.getAll();
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await organizationsApi.create(formData);
      setShowCreateForm(false);
      setFormData({ name: '', slug: '', description: '' });
      loadOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleJoin = async (orgId: string) => {
    try {
      await membershipsApi.join(orgId);
      loadOrganizations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join organization');
    }
  };

  const handleLeave = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to leave ${orgName}?`)) {
      return;
    }

    try {
      await membershipsApi.leave(orgId);
      loadOrganizations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to leave organization');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Club OS</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.email})
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Organization'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Coding Club"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="coding-club"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Learn programming together..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Organization
              </button>
            </form>
          </div>
        )}

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No organizations yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {org.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {org.description || 'No description'}
                </p>
                
                {/* Member count */}
                <div className="text-xs text-gray-500 mb-3">
                  {org.memberCount} {org.memberCount === 1 ? 'member' : 'members'}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    /{org.slug}
                  </span>
                  
                  <div className="flex gap-2">
                    {org.isCreator ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Creator
                      </span>
                    ) : org.isMember ? (
                      <button
                        onClick={() => handleLeave(org.id, org.name)}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(org.id)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Join
                      </button>
                    )}
                    
                    {(org.isMember || org.isCreator) && (
                      <>
                        <a
                          href={`/organizations/${org.slug}/members`}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                        >
                          Members
                        </a>
                        <a
                          href={`/organizations/${org.slug}/events`}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                        >
                          Events
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Creator info */}
                <div className="text-xs text-gray-400 mt-2">
                  by {org.createdBy.firstName || org.createdBy.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { membershipsApi, organizationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Member {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function MembersPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setError('');
      
      // First, get organization by slug (we need to find it)
      const allOrgs = await organizationsApi.getAll();
      const org = allOrgs.find((o: any) => o.slug === slug);
      
      if (!org) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      setOrganization(org);

      // Then get members
      const membersData = await membershipsApi.getMembers(org.id);
      setMembers(membersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {organization?.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`/organizations/${slug}/members`}
                className="text-sm font-medium text-blue-600"
              >
                Members
              </a>
              <a
                href={`/organizations/${slug}/events`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Events
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Members ({members.length})
            </h2>
            {organization?.description && (
              <p className="text-sm text-gray-600 mt-1">
                {organization.description}
              </p>
            )}
          </div>

          {members.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-600">
              No members yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {(member.user.firstName?.[0] || member.user.email[0]).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.user.firstName && member.user.lastName
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.user.email}
                        </div>
                      </div>
                    </div>

                    {/* Role & Date */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {member.role}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {formatDate(member.joinedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

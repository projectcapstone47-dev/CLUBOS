'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Event {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  eventType: string;
  maxAttendees?: number;
  isPublic: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const eventId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    eventType: 'general',
    maxAttendees: '',
    isPublic: true,
    status: 'draft',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const data = await eventsApi.getOne(eventId);
      setEvent(data);

      // Populate form
      const startDate = new Date(data.startDate);
      const endDate = data.endDate ? new Date(data.endDate) : null;

      setFormData({
        title: data.title,
        description: data.description || '',
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toISOString().split('T')[1].substring(0, 5),
        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
        endTime: endDate ? endDate.toISOString().split('T')[1].substring(0, 5) : '',
        venue: data.venue || '',
        eventType: data.eventType,
        maxAttendees: data.maxAttendees?.toString() || '',
        isPublic: data.isPublic,
        status: data.status,
      });
    } catch (err) {
      console.error('Failed to load event:', err);
      router.push(`/organizations/${slug}/events`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startDateTime = `${formData.startDate}T${formData.startTime}:00.000Z`;
      const endDateTime = formData.endDate && formData.endTime
        ? `${formData.endDate}T${formData.endTime}:00.000Z`
        : undefined;

      const updateData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        venue: formData.venue || undefined,
        eventType: formData.eventType,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        isPublic: formData.isPublic,
      };

      await eventsApi.update(eventId, updateData);
      setEditing(false);
      loadEvent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this event? It will be visible to all members.')) {
      return;
    }

    try {
      await eventsApi.publish(eventId);
      loadEvent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsApi.cancel(eventId);
      loadEvent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel event');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event permanently? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsApi.delete(eventId);
      router.push(`/organizations/${slug}/events`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isCreator = event && user && event.createdBy.id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/organizations/${slug}/events`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Events
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {!editing ? (
            // View Mode
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <span className={`text-sm px-3 py-1 rounded ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Organized by {event.organization.name}
                  </p>
                </div>

                {isCreator && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    {event.status === 'draft' && (
                      <button
                        onClick={handlePublish}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Publish
                      </button>
                    )}
                    {event.status === 'published' && (
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Cancel Event
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Event Type</h3>
                  <p className="text-gray-900 capitalize">{event.eventType}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Visibility</h3>
                  <p className="text-gray-900">{event.isPublic ? 'Public' : 'Private'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Start Time</h3>
                  <p className="text-gray-900">{formatDate(event.startDate)}</p>
                </div>

                {event.endDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">End Time</h3>
                    <p className="text-gray-900">{formatDate(event.endDate)}</p>
                  </div>
                )}

                {event.venue && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Venue</h3>
                    <p className="text-gray-900">{event.venue}</p>
                  </div>
                )}

                {event.maxAttendees && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Max Attendees</h3>
                    <p className="text-gray-900">{event.maxAttendees}</p>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="text-sm text-gray-500">
                <p>
                  Created by {event.createdBy.firstName || event.createdBy.email} on{' '}
                  {new Date(event.createdAt).toLocaleDateString()}
                </p>
                {event.updatedAt !== event.createdAt && (
                  <p>Last updated on {new Date(event.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdate} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h2>

              {/* Same form fields as create page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="general">General</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this event public
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

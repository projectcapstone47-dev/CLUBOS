'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { eventsApi, organizationsApi } from '@/lib/api';
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
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  isMember: boolean;
  isCreator: boolean;
}

export default function EventsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuthStore();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      // Find organization by slug
      const orgs = await organizationsApi.getAll();
      const org = orgs.find((o: any) => o.slug === slug);
      
      if (!org) {
        router.push('/dashboard');
        return;
      }

      setOrganization(org);

      // Load events
      const eventsData = await eventsApi.getByOrganization(org.id);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return events.filter(e => new Date(e.startDate) >= now && e.status !== 'cancelled');
      case 'past':
        return events.filter(e => new Date(e.startDate) < now || e.status === 'completed');
      default:
        return events;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-purple-100 text-purple-800';
      case 'seminar':
        return 'bg-blue-100 text-blue-800';
      case 'competition':
        return 'bg-orange-100 text-orange-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  const filteredEvents = getFilteredEvents();

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
              <h1 className="text-xl font-bold text-gray-900">{organization.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`/organizations/${slug}/members`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Members
              </a>
              <a
                href={`/organizations/${slug}/events`}
                className="text-sm font-medium text-blue-600"
              >
                Events
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and view events for {organization.name}
            </p>
          </div>
          
          {(organization.isMember || organization.isCreator) && (
            <button
              onClick={() => router.push(`/organizations/${slug}/events/create`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Event
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past
          </button>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No events yet. Create your first event!' 
                : `No ${filter} events.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/organizations/${slug}/events/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <div className="font-medium text-gray-900">
                      {formatDate(event.startDate)}
                    </div>
                  </div>

                  {event.endDate && (
                    <div>
                      <span className="text-gray-500">End:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(event.endDate)}
                      </div>
                    </div>
                  )}

                  {event.venue && (
                    <div>
                      <span className="text-gray-500">Venue:</span>
                      <div className="font-medium text-gray-900">
                        {event.venue}
                      </div>
                    </div>
                  )}

                  {event.maxAttendees && (
                    <div>
                      <span className="text-gray-500">Capacity:</span>
                      <div className="font-medium text-gray-900">
                        {event.maxAttendees} attendees
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>
                    by {event.createdBy.firstName || event.createdBy.email}
                  </span>
                  <span>
                    {event.isPublic ? 'Public' : 'Private'} Event
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

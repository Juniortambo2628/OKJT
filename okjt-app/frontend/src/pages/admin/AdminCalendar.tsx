import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  User,
  Video,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { submissionsApi } from '../../api/client';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'meeting' | 'deadline';
  client: string;
  email: string;
  isOnline: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Mock events data
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Website Consultation',
    date: '2025-12-23',
    time: '10:00',
    duration: 60,
    type: 'consultation',
    client: 'John Doe',
    email: 'john@example.com',
    isOnline: true,
    status: 'scheduled',
  },
  {
    id: 2,
    title: 'Portfolio Review',
    date: '2025-12-24',
    time: '14:00',
    duration: 45,
    type: 'meeting',
    client: 'Jane Smith',
    email: 'jane@company.com',
    isOnline: false,
    status: 'scheduled',
  },
  {
    id: 3,
    title: 'Project Deadline',
    date: '2025-12-27',
    time: '23:59',
    duration: 0,
    type: 'deadline',
    client: 'Tech Corp',
    email: 'project@techcorp.com',
    isOnline: false,
    status: 'scheduled',
  },
  {
    id: 4,
    title: 'Design Discussion',
    date: '2025-12-22',
    time: '11:00',
    duration: 30,
    type: 'consultation',
    client: 'Kevin Junior',
    email: 'kevin097@live.com',
    isOnline: true,
    status: 'scheduled',
  },
];

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  consultation: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  meeting: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  deadline: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const appointments = await submissionsApi.getUpcoming(30); // Next 30 days
      const mappedEvents: CalendarEvent[] = appointments
        .filter(sub => sub.consultation_date && sub.consultation_time && sub.id)
        .map((sub, _index) => ({
          id: sub.id!,
          title: sub.online_consultation ? 'Online Consultation' : 'In-Person Consultation',
          date: sub.consultation_date!,
          time: sub.consultation_time!,
          duration: 60, // Default duration
          type: 'consultation' as const,
          client: sub.name,
          email: sub.email,
          isOnline: sub.online_consultation || false,
          status: (sub.status === 'accepted' || sub.status === 'completed') ? 'scheduled' : 'scheduled',
        }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      // Fallback to mock data
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: `${year}-${String(month).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  // Check if date is today
  const isToday = (date: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return date === todayStr;
  };

  const calendarDays = generateCalendarDays();

  // Get selected day events
  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <AdminLayout title="Calendar" subtitle="Manage your schedule and appointments">
      {/* Calendar Header */}
      <div className="admin-calendar-header">
        <div className="admin-calendar-nav">
          <button onClick={prevMonth} className="admin-icon-btn">
            <ChevronLeft size={20} />
          </button>
          <h2 className="admin-calendar-title">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="admin-icon-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="admin-calendar-actions">
          <button onClick={goToToday} className="admin-btn-secondary">
            Today
          </button>
          <div className="admin-view-toggle">
            <button
              onClick={() => setViewMode('month')}
              className={`admin-view-btn ${viewMode === 'month' ? 'active' : ''}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`admin-view-btn ${viewMode === 'week' ? 'active' : ''}`}
            >
              Week
            </button>
          </div>
          <button className="admin-btn-primary">
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      <div className="admin-calendar-layout">
        {/* Calendar Grid */}
        <motion.div
          className="admin-card admin-calendar-grid-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Day Headers */}
          <div className="admin-calendar-days-header">
            {DAYS.map(day => (
              <div key={day} className="admin-calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="admin-calendar-grid">
            {calendarDays.map((dayInfo, index) => {
              const dayEvents = getEventsForDate(dayInfo.date);
              const isSelected = selectedDate === dayInfo.date;
              const isTodayDate = isToday(dayInfo.date);

              return (
                <motion.div
                  key={index}
                  className={`admin-calendar-cell ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => setSelectedDate(dayInfo.date)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="admin-calendar-cell-day">{dayInfo.day}</span>
                  <div className="admin-calendar-cell-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`admin-calendar-event-dot ${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text}`}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="admin-calendar-more">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar - Events List */}
        <motion.div
          className="admin-card admin-calendar-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="admin-card-header">
            <h3>
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Upcoming Events'}
            </h3>
          </div>

          <div className="admin-calendar-events-list">
            {(selectedDate ? selectedDayEvents : events.filter(e => e.status === 'scheduled').slice(0, 5)).length === 0 ? (
              <div className="admin-empty-state small">
                <Clock size={32} />
                <p>No events {selectedDate ? 'on this day' : 'scheduled'}</p>
              </div>
            ) : (
              (selectedDate ? selectedDayEvents : events.filter(e => e.status === 'scheduled').slice(0, 5)).map((event) => (
                <motion.div
                  key={event.id}
                  className={`admin-calendar-event-card ${eventTypeColors[event.type].border}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="admin-calendar-event-header">
                    <span className={`admin-calendar-event-type ${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text}`}>
                      {event.type}
                    </span>
                    <button className="admin-icon-btn small">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                  <h4 className="admin-calendar-event-title">{event.title}</h4>
                  <div className="admin-calendar-event-details">
                    <span>
                      <Clock size={12} />
                      {event.time} {event.duration > 0 && `(${event.duration}min)`}
                    </span>
                    <span>
                      <User size={12} />
                      {event.client}
                    </span>
                    {event.isOnline && (
                      <span className="online">
                        <Video size={12} />
                        Online
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal-backdrop"
            onClick={() => setSelectedEvent(null)}
          />
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="admin-modal-header">
              <div>
                <span className={`admin-badge ${eventTypeColors[selectedEvent.type].bg} ${eventTypeColors[selectedEvent.type].text}`}>
                  {selectedEvent.type}
                </span>
                <h2>{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="admin-modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="admin-modal-grid">
                <div className="admin-modal-field">
                  <label>Date</label>
                  <p>{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Time</label>
                  <p>{selectedEvent.time} {selectedEvent.duration > 0 && `(${selectedEvent.duration} minutes)`}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Client</label>
                  <p>{selectedEvent.client}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Email</label>
                  <p>{selectedEvent.email}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Location</label>
                  <p>{selectedEvent.isOnline ? 'Online Meeting (Video Call)' : 'In Person'}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Status</label>
                  <span className={`admin-badge ${selectedEvent.status === 'scheduled' ? 'admin-badge-success' : selectedEvent.status === 'cancelled' ? 'admin-badge-danger' : 'admin-badge-info'}`}>
                    {selectedEvent.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button className="admin-btn-primary">
                  <Check size={18} />
                  Mark Complete
                </button>
                <button className="admin-btn-secondary">
                  <Edit2 size={18} />
                  Edit
                </button>
                <button className="admin-btn-secondary" style={{ color: '#dc2626' }}>
                  <Trash2 size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}


import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { Plus, Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const typeColors = {
  'Community Meeting': 'bg-brand-500',
  'Health Campaign': 'bg-emerald-500',
  'Sports Event': 'bg-amber-500',
  'Cultural Event': 'bg-purple-500',
  'Emergency Drill': 'bg-rose-500',
  'Livelihood Program': 'bg-teal-500',
  'Other': 'bg-slate-500',
};

const typeBadge = {
  'Community Meeting': 'bg-brand-50 text-brand-700 border-brand-200',
  'Health Campaign': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sports Event': 'bg-amber-50 text-amber-700 border-amber-200',
  'Cultural Event': 'bg-purple-50 text-purple-700 border-purple-200',
  'Emergency Drill': 'bg-rose-50 text-rose-700 border-rose-200',
  'Livelihood Program': 'bg-teal-50 text-teal-700 border-teal-200',
  'Other': 'bg-slate-50 text-slate-700 border-slate-200',
};

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [form, setForm] = useState({
    title: '', description: '', event_date: '', start_time: '', end_time: '',
    location: '', category: 'Community', max_attendees: '',
  });

  const isStaff = user && user.role !== 'Resident';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const r = await api.get('/events');
      if (r.data.success) setEvents(r.data.events || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created!');
      setIsModalOpen(false);
      fetchEvents();
    } catch { toast.error('Failed to create event'); }
  };

  const handleRSVP = async (id) => {
    try { await api.post(`/events/${id}/rsvp`); toast.success('RSVP submitted!'); fetchEvents(); }
    catch { toast.error('Failed to RSVP'); }
  };

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = {};
  events.forEach(ev => {
    const d = new Date(ev.event_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!eventsByDay[key]) eventsByDay[key] = [];
      eventsByDay[key].push(ev);
    }
  });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events Calendar</h1>
          <p className="text-sm text-slate-500">Upcoming community activities, programs, and events</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7">
            {/* Empty leading cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-b border-r border-slate-50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasEvents = !!eventsByDay[day];
              const dayEvents = eventsByDay[day] || [];
              const isSelected = selectedDay === day;
              const todayMark = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-20 border-b border-r border-slate-50 p-2 text-left hover:bg-brand-50/40 transition-colors relative ${
                    isSelected ? 'bg-brand-50 ring-2 ring-inset ring-brand-400' : ''
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                    todayMark
                      ? 'bg-brand-600 text-white'
                      : isSelected
                      ? 'text-brand-700'
                      : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full ${typeColors[ev.category] || 'bg-slate-400'}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-bold">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-[11px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Events Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {selectedDay ? (
            <>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{MONTHS[month]} {selectedDay}, {year}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedDayEvents.length === 0 ? 'No events' : `${selectedDayEvents.length} event${selectedDayEvents.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Calendar className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-medium">No events on this day</p>
                  {isStaff && (
                    <button
                      onClick={() => { setForm(f => ({ ...f, event_date: `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` })); setIsModalOpen(true); }}
                      className="mt-3 px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl"
                    >
                      + Create Event Here
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
                  {selectedDayEvents.map(ev => (
                    <div key={ev.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${typeColors[ev.category] || 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight">{ev.title}</h4>
                          <span className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${typeBadge[ev.category] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            {ev.category}
                          </span>
                          {ev.description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{ev.description}</p>}
                          <div className="mt-2 space-y-1">
                            {ev.start_time && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                {ev.start_time}{ev.end_time && ` – ${ev.end_time}`}
                              </div>
                            )}
                            {ev.location && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5" />
                                {ev.location}
                              </div>
                            )}
                            {ev.max_attendees && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Users className="w-3.5 h-3.5" />
                                Max {ev.max_attendees} attendees
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRSVP(ev.id)}
                            className="mt-3 w-full py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition-colors"
                          >
                            RSVP / Attend
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 px-6">
              <Calendar className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-center">Click a date on the calendar to view events</p>
              <p className="text-xs text-slate-400 text-center mt-1">Colored dots indicate scheduled events</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming events list */}
      {!loading && events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">All Upcoming Events</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {events.filter(ev => new Date(ev.event_date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).slice(0, 6).map(ev => (
              <div key={ev.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-1 h-12 rounded-full shrink-0 ${typeColors[ev.category] || 'bg-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(ev.event_date)}</span>
                    {ev.location && <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>}
                  </div>
                </div>
                <button onClick={() => handleRSVP(ev.id)} className="shrink-0 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl">
                  RSVP
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {['Community','Health','Meeting','Clean-up','Vaccination','Sports','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input type="date" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Attendees</label>
              <input type="number" value={form.max_attendees} onChange={e => setForm({...form, max_attendees: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Create Event</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;

import React, { useState, useEffect } from 'react';
import { GrPrevious, GrNext } from 'react-icons/gr';
import { AiOutlineClose } from 'react-icons/ai';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const generateCalendar = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = date.getDay();
  const calendar: number[][] = [[]];

  // Fill empty days before the first day
  for (let i = 0; i < startDay; i++) {
    calendar[0].push(0);
  }

  // Fill days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    if (calendar[calendar.length - 1].length === 7) {
      calendar.push([]);
    }
    calendar[calendar.length - 1].push(day);
  }

  // Fill empty days after the last day
  while (calendar[calendar.length - 1].length < 7) {
    calendar[calendar.length - 1].push(0);
  }

  return calendar;
};

interface Event {
  id: string;
  title: string;
  date: string;
  // add other event properties as needed
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BASE_API_URL = 'https://calendar-backend-pi-nine.vercel.app/api';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, Event[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [showEventsList, setShowEventsList] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendar = generateCalendar(year, month);
  const today = new Date();

  // Fetch events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      try {
        const formattedStart = getLocalDateString(startDate);
        const formattedEnd = getLocalDateString(endDate);

        const response = await fetch(
          `${BASE_API_URL}/events?start=${formattedStart}&end=${formattedEnd}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        // Group events by date
        const eventsByDate: Record<string, Event[]> = {};
        data.forEach((event: Event) => {
          const dateStr = event.date.split('T')[0]; // Use the date directly from the server
          if (!eventsByDate[dateStr]) {
            eventsByDate[dateStr] = [];
          }
          eventsByDate[dateStr].push(event);
        });

        setEvents(eventsByDate);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [year, month]);

  const handleDateClick = (day: number) => {
    if (day === 0) return;
    // Create date at noon to avoid timezone issues
    const clickedDate = new Date(year, month, day, 12, 0, 0);
    setSelectedDate(clickedDate);
    const dateEvents = getEventsForDate(day);
    if (dateEvents.length > 0) {
      setSelectedDateEvents(dateEvents);
      setShowEventsList(true);
    } else {
      setShowEventsList(false);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEventTitle.trim()) return;

    try {
      const formattedDate = getLocalDateString(selectedDate);

      const response = await fetch(`${BASE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEventTitle,
          date: formattedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add event');
      }

      const newEvent = await response.json();
      const dateStr = formattedDate;
      setEvents((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), newEvent],
      }));
      setNewEventTitle('');
      setSelectedDate(null);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      today.getFullYear()
    );
  };

  const getEventsForDate = (day: number): Event[] => {
    if (day === 0) return [];
    const dateStr = getLocalDateString(new Date(year, month, day));
    return events[dateStr] || [];
  };

  // Move modals outside of the main render to prevent re-rendering
  const eventModal = showEventsList && (
    <EventsModal
      date={selectedDate}
      events={selectedDateEvents}
      onClose={() => setShowEventsList(false)}
    />
  );

  const addEventModal = selectedDate && !showEventsList && (
    <AddEventModal
      date={selectedDate}
      title={newEventTitle}
      onTitleChange={setNewEventTitle}
      onAdd={handleAddEvent}
      onClose={() => setSelectedDate(null)}
    />
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GrPrevious size={20} />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GrNext size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-semibold text-center text-gray-600">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendar.flat().map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              p-3 rounded-lg cursor-pointer transition-colors
              ${
                day === 0
                  ? 'bg-gray-100 cursor-default'
                  : isToday(day)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'hover:bg-gray-100'
              }
            `}
          >
            <div className="text-center">
              {day !== 0 && (
                <>
                  <div className={`${isToday(day) ? 'font-bold' : ''}`}>
                    {day}
                  </div>
                  {getEventsForDate(day).length > 0 && (
                    <div className="mt-1 h-1.5 w-1.5 mx-auto rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {eventModal}
      {addEventModal}
    </div>
  );
};

// Move modal components outside the main component
interface EventsModalProps {
  date: Date | null;
  events: Event[];
  onClose: () => void;
}

const EventsModal: React.FC<EventsModalProps> = ({ date, events, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          Events for {date?.toLocaleDateString()}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <AiOutlineClose size={24} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="mb-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <h4 className="font-semibold">{event.title}</h4>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface AddEventModalProps {
  date: Date | null;
  title: string;
  onTitleChange: (value: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  date,
  title,
  onTitleChange,
  onAdd,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          Add Event for {date?.toLocaleDateString()}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <AiOutlineClose size={24} />
        </button>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Event title"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Event
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Calendar;

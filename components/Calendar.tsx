import React, { useState } from 'react';
import { GrPrevious } from 'react-icons/gr';
import { GrNext } from 'react-icons/gr';

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

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendar = generateCalendar(year, month);
  const today = new Date();

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

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded hover:bg-gray-300"
        >
          <GrPrevious />
        </button>
        <h2 className="text-lg font-bold">
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded hover:bg-gray-300"
        >
          <GrNext />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-bold">
            {day}
          </div>
        ))}
        {calendar.flat().map((day, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              day === 0
                ? 'bg-gray-200'
                : isToday(day)
                ? 'bg-red-500 text-white font-bold'
                : 'bg-blue-100 hover:bg-blue-200'
            }`}
          >
            {day !== 0 && day}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Calendar;

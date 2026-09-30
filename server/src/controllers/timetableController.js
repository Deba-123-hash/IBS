import { successResponse, errorResponse } from '../utils/response.js';

export const getMyTimetable = async (req, res) => {
  try {
    const weeklySchedule = {
      Monday: [
        { time: '09:00 - 10:00', code: 'CS-401', subject: 'Database Management Systems', room: 'LH-201', faculty: 'Dr. Priya Nair' },
        { time: '10:00 - 11:00', code: 'CS-402', subject: 'Computer Networks', room: 'LH-201', faculty: 'Prof. Ananya Sen' },
        { time: '11:15 - 01:15', code: 'CS-401L', subject: 'Database Systems Lab', room: 'Lab 3 (Ground Floor)', faculty: 'Dr. Priya Nair' },
        { time: '02:00 - 03:00', code: 'HS-201', subject: 'Professional Ethics & Law', room: 'LH-204', faculty: 'Prof. S. Mishra' }
      ],
      Tuesday: [
        { time: '09:00 - 10:00', code: 'CS-403', subject: 'Design & Analysis of Algorithms', room: 'LH-201', faculty: 'Dr. A. K. Das' },
        { time: '10:00 - 11:00', code: 'CS-404', subject: 'Operating Systems & System Ops', room: 'LH-201', faculty: 'Dr. Rajesh Rao' },
        { time: '11:15 - 12:15', code: 'CS-402', subject: 'Computer Networks', room: 'LH-201', faculty: 'Prof. Ananya Sen' }
      ],
      Wednesday: [
        { time: '09:00 - 10:00', code: 'CS-401', subject: 'Database Management Systems', room: 'LH-201', faculty: 'Dr. Priya Nair' },
        { time: '10:00 - 11:00', code: 'CS-403', subject: 'Design & Analysis of Algorithms', room: 'LH-201', faculty: 'Dr. A. K. Das' },
        { time: '02:00 - 05:00', code: 'CS-404L', subject: 'Operating Systems Kernel Lab', room: 'Lab 1', faculty: 'Dr. Rajesh Rao' }
      ],
      Thursday: [
        { time: '09:00 - 10:00', code: 'CS-404', subject: 'Operating Systems & System Ops', room: 'LH-201', faculty: 'Dr. Rajesh Rao' },
        { time: '10:00 - 11:00', code: 'HS-201', subject: 'Professional Ethics & Law', room: 'LH-204', faculty: 'Prof. S. Mishra' },
        { time: '11:15 - 12:15', code: 'CS-402', subject: 'Computer Networks', room: 'LH-201', faculty: 'Prof. Ananya Sen' }
      ],
      Friday: [
        { time: '09:00 - 10:00', code: 'CS-403', subject: 'Design & Analysis of Algorithms', room: 'LH-201', faculty: 'Dr. A. K. Das' },
        { time: '10:00 - 11:00', code: 'CS-401', subject: 'Database Management Systems', room: 'LH-201', faculty: 'Dr. Priya Nair' },
        { time: '02:00 - 04:00', code: 'PROJ-1', subject: 'Capstone Innovation Mentorship', room: 'Seminar Hall B', faculty: 'HOD CSE' }
      ]
    };

    const activeAlerts = [
      {
        id: 'upd_01',
        subject: 'Database Management Systems',
        status: 'ROOM_CHANGED',
        message: 'Class relocated to Lecture Hall 102 for guest technical lecture.',
        date: 'Today'
      }
    ];

    return successResponse(res, { schedule: weeklySchedule, alerts: activeAlerts }, 'Weekly timetable schedule loaded');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch timetable', 'TIMETABLE_ERROR', 500);
  }
};

import { successResponse, errorResponse } from '../utils/response.js';

export const getMyHostelRoom = async (req, res) => {
  try {
    const roomInfo = {
      hostelName: 'Aryabhatta Hall of Residence',
      block: 'Block B (West Wing)',
      floor: 3,
      roomNumber: '304',
      capacity: 2,
      occupancy: 2,
      wardenName: 'Suresh Patel',
      wardenContact: '+91 98765 11223',
      roommate: {
        name: 'Rohan Mehra',
        rollNumber: 'CS2023019',
        branch: 'Computer Science',
        contact: '+91 98221 44556'
      },
      assets: [
        { id: 'ast_01', tag: 'AST-HST-B-304-01', name: 'High-Speed Ceiling Fan', condition: 'OPERATIONAL', category: 'ELECTRICAL' },
        { id: 'ast_02', tag: 'AST-HST-B-304-02', name: 'Wooden Study Table with Drawer', condition: 'OPERATIONAL', category: 'FURNITURE' },
        { id: 'ast_03', tag: 'AST-HST-B-304-03', name: 'Ergonomic Mesh Chair', condition: 'OPERATIONAL', category: 'FURNITURE' },
        { id: 'ast_04', tag: 'AST-HST-B-304-04', name: 'Steel Almirah / Wardrobe', condition: 'OPERATIONAL', category: 'FURNITURE' },
        { id: 'ast_05', tag: 'AST-HST-B-304-05', name: 'Washroom Sink & Tap Fixture', condition: 'DAMAGED_LEAKING', category: 'PLUMBING' }
      ]
    };

    return successResponse(res, roomInfo, 'Hostel room information retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch hostel details', 'HOSTEL_ERROR', 500);
  }
};

export const getRoomsGrid = async (req, res) => {
  try {
    // Generate an interactive 24-room grid for Block B
    const rooms = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let r = 1; r <= 8; r++) {
        const num = `${floor}0${r}`;
        const isMaintenance = num === '304';
        const isPartial = num === '104' || num === '206';
        rooms.push({
          id: `room_${num}`,
          roomNumber: num,
          floor,
          capacity: 2,
          currentOccupancy: isMaintenance ? 2 : isPartial ? 1 : 2,
          status: isMaintenance ? 'MAINTENANCE_REQUIRED' : isPartial ? 'PARTIALLY_VACANT' : 'OCCUPIED',
          block: 'Block B'
        });
      }
    }

    return successResponse(res, {
      hostel: 'Aryabhatta Hall of Residence',
      block: 'Block B',
      totalRooms: 24,
      totalCapacity: 48,
      occupiedBeds: 45,
      rooms
    }, 'Hostel room grid retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to load room grid', 'GRID_ERROR', 500);
  }
};

import prisma, { pool } from '../server/src/config/database.js';

async function verify() {
  console.log('=== NEON DATABASE DATASET VERIFICATION ===\n');

  const models = [
    { name: 'Users', fn: () => prisma.user.count() },
    { name: 'Students', fn: () => prisma.student.count() },
    { name: 'Faculty/Staff', fn: () => prisma.staff.count() },
    { name: 'Departments', fn: () => prisma.department.count() },
    { name: 'Programs', fn: () => prisma.program.count() },
    { name: 'Batches', fn: () => prisma.batch.count() },
    { name: 'Hostels', fn: () => prisma.hostel.count() },
    { name: 'Rooms', fn: () => prisma.room.count() },
    { name: 'Room Allocations', fn: () => prisma.roomAllocation.count() },
    { name: 'Assets', fn: () => prisma.asset.count() },
    { name: 'Subjects', fn: () => prisma.subject.count() },
    { name: 'Timetable Periods', fn: () => prisma.timetable.count() },
    { name: 'Class Updates', fn: () => prisma.classUpdate.count() },
    { name: 'Attendance Sessions', fn: () => prisma.attendance.count() },
    { name: 'Attendance Records', fn: () => prisma.attendanceRecord.count() },
    { name: 'Complaint Categories', fn: () => prisma.complaintCategory.count() },
    { name: 'Complaints', fn: () => prisma.complaint.count() },
    { name: 'Complaint Assignments', fn: () => prisma.complaintAssignment.count() },
    { name: 'Complaint Comments', fn: () => prisma.complaintComment.count() },
    { name: 'Complaint Histories', fn: () => prisma.complaintStatusHistory.count() },
    { name: 'Leave Requests', fn: () => prisma.leaveRequest.count() },
    { name: 'Gate Passes', fn: () => prisma.gatePass.count() },
    { name: 'Gate Approvals', fn: () => prisma.gatePassApproval.count() },
    { name: 'Gate Events', fn: () => prisma.gatePassEvent.count() },
    { name: 'Certificates', fn: () => prisma.certificate.count() },
    { name: 'Certificate Requests', fn: () => prisma.certificateRequest.count() },
    { name: 'Fee Records', fn: () => prisma.feeRecord.count() },
    { name: 'Fee Payments', fn: () => prisma.feePayment.count() },
    { name: 'Fee Queries', fn: () => prisma.feeQuery.count() },
    { name: 'Mess Menus', fn: () => prisma.messMenu.count() },
    { name: 'Mess Feedbacks', fn: () => prisma.messFeedback.count() },
    { name: 'Visitors', fn: () => prisma.visitor.count() },
    { name: 'Visitor Logs', fn: () => prisma.visitorLog.count() },
    { name: 'Notices', fn: () => prisma.notice.count() },
    { name: 'Notice Reads', fn: () => prisma.noticeRead.count() },
    { name: 'Notifications', fn: () => prisma.notification.count() },
    { name: 'Knowledge Documents', fn: () => prisma.knowledgeDocument.count() },
    { name: 'Audit Logs', fn: () => prisma.auditLog.count() }
  ];

  for (const m of models) {
    try {
      const count = await m.fn();
      console.log(`- ${m.name.padEnd(25)}: ${count}`);
    } catch (e) {
      console.log(`- ${m.name.padEnd(25)}: ERROR (${e.message})`);
    }
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) await pool.end();
    process.exit(0);
  });

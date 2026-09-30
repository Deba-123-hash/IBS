import prisma from '../config/database.js';

export class UserRepository {
  async findById(id) {
    if (!prisma || !prisma.user) return null;
    return await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        staffProfile: true
      }
    });
  }

  async findByEmail(email) {
    if (!prisma || !prisma.user) return null;
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: true,
        staffProfile: true
      }
    });
  }

  async countByRole(role) {
    if (!prisma || !prisma.user) return 0;
    return await prisma.user.count({
      where: { role, isActive: true }
    });
  }
}

export default new UserRepository();

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async getRolePermissions(role: Role) {
    return this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
  }

  async assignPermission(role: Role, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: { role, permissionId },
      include: { permission: true },
    });
  }

  async removePermission(role: Role, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: { role_permissionId: { role, permissionId } },
    });
  }
}

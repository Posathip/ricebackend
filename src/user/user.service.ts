import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import { CreateStaffDto } from 'src/dto/user.dto';

export interface StaffSummary {
  staffID: string;
  staffNo: number;
  staffName: string;
  email: string;
  phone: string | null;
  position: string | null;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStaff(): Promise<StaffSummary[]> {
    console.log('[UserService.getAllStaff]');
    try {
      const staffList = await this.prisma.staff.findMany({
        select: {
          staffID: true,
          staffNo: true,
          staffName: true,
          email: true,
          phone: true,
          position: true,
        },
      });
      if (staffList.length === 0) throw new NotFoundException('Staff not found');

      const result = staffList.map((staff) => ({
        ...staff,
        staffName: this.extractFirstName(staff.staffName),
      }));
      console.log('[UserService.getAllStaff] result count:', result.length);
      return result;
    } catch (error) {
      rethrowAsHttpException('UserService.getAllStaff', error);
    }
  }

  async createManyStaff(dtoList: CreateStaffDto[]): Promise<{ message: string }> {
    console.log('[UserService.createManyStaff] count:', dtoList.length);
    try {
      const lastStaff = await this.prisma.staff.findFirst({
        orderBy: { staffNo: 'desc' },
        select: { staffNo: true },
      });
      const nextStaffNo = (lastStaff?.staffNo ?? 0) + 1;

      const { count } = await this.prisma.staff.createMany({
        data: dtoList.map((dto, index) => ({
          staffNo: nextStaffNo + index,
          staffName: dto.staffName,
          email: dto.email,
          phone: dto.phone,
          position: dto.position,
        })),
      });

      console.log('[UserService.createManyStaff] result created:', count);
      return { message: `Staff with email  created successfully` };
    } catch (error) {
      rethrowAsHttpException('UserService.createManyStaff', error);
    }
  }

  private extractFirstName(fullName: string | null): string {
    return fullName ? fullName.split(' ')[0] : '';
  }
}

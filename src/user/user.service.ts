import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStaffDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getUserData(request: any, response: any): Promise<void> {
    // console.log('[UserService.getUserData]');
    try {
      const users = await this.prisma.staff.findMany({
        select: {
          staffID: true,
          staffNo: true,
          staffName: true,
          email: true,
          phone: true,
          position: true,
        },
      });

      if (!users || users.length === 0) {
        // console.log('[UserService.getUserData] no staff found');
        return response.status(404).send({ message: 'Staff not found' });
      }

      const result = users.map((u) => ({
        ...u,
        staffName: u.staffName ? u.staffName.split(' ')[0] : '',
      }));

      // console.log('[UserService.getUserData] returned', result.length, 'staff');
      return response.status(200).send(result);
    } catch (error) {
      console.error('[UserService.getUserData]', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(message);
    }
  }

  async postData(
    dto: CreateStaffDto[],
    request: any,
    response: any,
  ): Promise<void> {
    // console.log('[UserService.postData] count:', dto.length);
    try {
      const last = await this.prisma.staff.findFirst({
        orderBy: { staffNo: 'desc' },
      });

      const nextStaffNo = (last?.staffNo ?? 0) + 1;

      await this.prisma.staff.createMany({
        data: dto.map((item) => ({
          staffNo: nextStaffNo,
          staffName: item.staffName,
          email: item.email,
          phone: item.phone,
          position: item.position,
        })),
      });

      // console.log('[UserService.postData] created', dto.length, 'staff');
      return response.status(200).send({
        message: `Staff with email  created successfully`,
      });
    } catch (error) {
      console.error('[UserService.postData]', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(message);
    }
  }
}

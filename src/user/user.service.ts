import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStaffDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {[x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,

    
  ) {}
  async getUserData(request: any, response: any) {
  const users = await this.prisma.staff.findMany(
    {
      select: {
      staffID: true,
      staffNo: true,
      staffName: true,
      email: true,
      phone: true,
      position: true,
    },
    }
  );

  if (!users || users.length === 0) {
    return response.status(404).send({ message: 'Staff not found' });
  }

  // ตัดเอาเฉพาะชื่อก่อนช่องว่างแรก
  const result = users.map(u => ({
    ...u,
     staffName: u.staffName ? u.staffName.split(' ')[0] : '',

  }));

  return response.status(200).send(result);
}
    async postData(dto: CreateStaffDto[], request: any, response: any) {
       
        const newStaff = await this.prisma.staff.createMany({
       data: dto.map((dto) => ({
            staffNo: dto.staffNo,
            staffName: dto.staffName,
            email: dto.email,
            phone: dto.phone,
            position: dto.position,
      })),
        });
    
        return response.status(200).send({
        message: `Staff with email  created successfully`,
   
        });
    }
}
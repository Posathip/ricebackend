import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePackingDto } from 'src/dto/packing.dto';
import { CreateRiceManageDto, UpdateRiceManageDto } from 'src/dto/rice.dto';
import { CreateStaffDto, UpdateStaffDto } from 'src/dto/user.dto';

@Injectable()
export class AdminService {
     [x: string]: any;
      constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
      ) {}
    async createRice(dto: CreateRiceManageDto, request: any, response: any) {
        try {
          const newRice = await this.prisma.riceManage.create({
            data:dto,
          });
          return response.status(201).send({ message: 'Created rice data complete', data: newRice });
        } catch (error) {
          console.error('Error creating rice:', error);
          return response.status(500).send({ message: 'Internal server error' });
        }
      }
    async getAllRice(request: any, response: any) {
        try {
       const riceList = await this.prisma.riceManage.findMany({
  orderBy: {
    riceNameEng: 'asc', // Sort by riceNameEng in ascending order
  },
});

          return response.status(200).send(riceList);
        } catch (error) {
          console.error('Error fetching rice list:', error);
          return response.status(500).send({ message: 'Internal server error' });
        }
      }

      async getRiceById(id: string, request: any, response: any) {
        try {
          const rice = await this.prisma.riceManage.findUnique({
            where: { riceManageID:id },
          });
            if (!rice) {
            return response.status(404).send({ message: 'Rice not found' });
            }
            return response.status(200).send(rice);
        } catch (error) {
            console.error('Error fetching rice by ID:', error);
            return response.status(500).send({ message: 'Internal server error' });
            }
        }

        async updateRice(id: string, dto: UpdateRiceManageDto, request: any, response: any) {
        try {
            const existingRice = await this.prisma.riceManage.findUnique({
                where: { riceManageID:id },
            });
            if (!existingRice) {
                return response.status(404).send({ message: 'Rice not found' });
            }
            const updatedRice = await this.prisma.riceManage.update({
                where: { riceManageID:id },
                data: dto,
            });
            return response.status(200).send(updatedRice);
        } catch (error) {
            console.error('Error updating rice:', error);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }

    async deleterice(id: string, request: any, response: any) {
        try {
          const existingRice = await this.prisma.riceManage.findUnique({
                where: { riceManageID:id },
            });
            if (!existingRice) {
                return response.status(404).send({ message: 'Rice not found' });
            }
            await this.prisma.riceManage.delete({
                where: { riceManageID:id },
            });
            return response.status(200).send({ message: 'Rice deleted successfully' });
            }
            catch (error) {
            console.error('Error deleting rice:', error);
                
            return response.status(500).send({ message: 'Internal server error' });
        }
    }

    async searchrice(riceNameEng?: string, riceNameThai?: string, riceType?: string, request?: any, response?: any) {
        try {
            const whereConditions: any = {};
            const filters: any[] = [];

            if (riceNameEng) {
                filters.push({ riceNameEng: { contains: riceNameEng, mode: 'insensitive' } });
            }
            if (riceNameThai) {
                filters.push({ riceNameThai: { contains: riceNameThai, mode: 'insensitive' } });
            }
            if (riceType) {
                filters.push({ riceType: { contains: riceType, mode: 'insensitive' } });
            }

            if (filters.length > 0) {
                whereConditions.OR = filters;
            }

            if (filters.length === 0) {
      const riceList = await this.prisma.riceManage.findMany({
        orderBy: {
          riceNameEng: 'asc',
        },
      });

      return response.status(200).send(riceList);
    }


    const riceList = await this.prisma.riceManage.findMany({
      where: {
        OR: filters,
      },
      orderBy: {
        riceNameEng: 'asc',
      },
    });

    return response.status(200).send(riceList);
        } catch (error) { 
            console.error('Error searching rice by name:', error);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }
    async createManyRice(dto: CreateRiceManageDto[], request: any, response: any) {
        try {
          const newRiceList = await this.prisma.riceManage.createMany({
            data: dto,
            skipDuplicates: true, // Skip duplicates based on unique constraints
          });
          return response.status(201).send({ result: "Created rice data complete", data: newRiceList });
        } catch (error) {
          console.error('Error creating multiple rice records:', error);
          return response.status(500).send({ message: 'Internal server error' });
        }
        }

        async createStaff(dto: CreateStaffDto, request: any, response: any) {
        try {
          const newStaff = await this.prisma.staff.create({
            data:dto,
          });
          return response.status(201).send(newStaff);
        }


            catch (error) {
            console.error('Error creating staff:', error);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }

    async getAllStaff(request: any, response: any) {
        try {
       const staffList = await this.prisma.staff.findMany({
    orderBy: {
        staffNo: 'asc', // Sort by staffNo in ascending order
    },
    });
            return response.status(200).send(staffList);
        } catch (error) {
            console.error('Error fetching staff list:', error);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }
    async getStaffById(id: string, request: any, response: any) {
        try {
          const staff = await this.prisma.staff.findUnique({
            where: { staffID:id },
            select: {
                staffID: true,
                staffNo: true,
                staffName: true,
                email: true,
                phone: true,
                position: true,
            },
          });
            if (!staff) {
            return response.status(404).send({ message: 'Staff not found' });
            }
            return response.status(200).send(staff);
        } catch (error) {
            console.error('Error fetching staff by ID:', error);
            return response.status(500).send({ message: 'Internal server error' });
            }
        }

        async deleteStaff(id: string, request: any, response: any) {
        try {
          const existingStaff = await this.prisma.staff.findUnique({
                where: { staffID:id },
            });
            if (!existingStaff) {
                return response.status(404).send({ message: 'Staff not found' });
            }
          await this.prisma.staff.delete({
            where: { staffID:id },
          });
          return response.status(200).send({ message: 'Staff deleted successfully' });
        } catch (error) {
            console.error('Error deleting staff:', error);
            return response.status(500).send({ message: 'Internal server error' });
        }
    }       
        async searchStaff(
  staffNo?: string,
  staffName?: string,
  staffSurname?: string,
  request?: any,
  response?: any
) {
  try {
    const whereConditions: any = {};
    const filters: any[] = [];

    // 🔍 staffNo
    if (staffNo) {
      filters.push({
        staffNo: {
          contains: staffNo,
          mode: 'insensitive',
        },
      });
    }

   
    const fullSearch = [staffName, staffSurname]
      .filter((v) => v && v.trim() !== '')
      .join(' ')
      .trim();

    if (fullSearch) {
      const words = fullSearch.split(/\s+/);

      filters.push({
        OR: [
          
          {
            fullName: {
              contains: fullSearch,
              mode: 'insensitive',
            },
          },
          // 🔹 ค้นแบบแยกคำ
          ...words.map((word) => ({
            fullName: {
              contains: word,
              mode: 'insensitive',
            },
          })),
        ],
      });
    }

  
    if (filters.length > 0) {
      whereConditions.AND = filters;
    }

    const result = await this.prisma.riceManage.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return response.status(200).send({
      message: 'Search staff success',
      data: result,
    });

  } catch (error) {
    console.error('Error searching staff:', error);
    return response.status(500).send({
      message: 'Internal server error',
    });
  }
}

async updateStaff(id: string, dto: UpdateStaffDto, request: any, response: any) {
  try {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { staffID: id },
    });
    
    if (!existingStaff) {
      return response.status(404).send({ message: 'Staff not found' });
    }
    const updatedStaff = await this.prisma.staff.update({
      where: { staffID: id },
      data: dto,
    });
    return response.status(200).send(updatedStaff);
  }

  catch (error) {
    console.error('Error updating staff:', error);
    return response.status(500).send({ message: 'Internal server error' });
  }
}
async addmanypacking(dto: CreatePackingDto[], request: any, response: any) {
  try {
    const newPackingList = await this.prisma.packing.createMany({
      data: dto,
      skipDuplicates: true, // Skip duplicates based on unique constraints
    });
    return response.status(201).send({ message: 'Created packing data complete', data: newPackingList });
  } catch (error) {
    console.error('Error creating multiple packing records:', error);
    return response.status(500).send({ message: 'Internal server error' });
  }
  
}

async addpacking(dto: CreatePackingDto, request: any, response: any) {
  try {
    const newPacking = await this.prisma.packing.create({
      data: dto,
    });
    return response.status(201).send({ message: 'Created packing data complete', data: newPacking });
  } catch (error) {
    console.error('Error creating packing:', error);
    return response.status(500).send({ message: 'Internal server error' });
  }
}
 async searchpacking(packingName?: string, unit?: string, request?: any, response?: any) {
  try {
    const whereConditions: any = {};
    const filters: any[] = [];
    
    if (packingName) {
      filters.push({ packingName: { contains: packingName, mode: 'insensitive' } });
    }
    if (unit) {
      filters.push({ unit: { contains: unit, mode: 'insensitive' } });
    }
    
    if (filters.length > 0) {
      whereConditions.AND = filters;
    }
    
    const packingList = await this.prisma.packing.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return response.status(200).send({ message: 'Search packing success', data: packingList });
  }

  catch (error) {
    console.error('Error searching packing:', error);
    return response.status(500).send({ message: 'Internal server error' });
  }
}

async getallpackingdata(request: any, response: any) {
  try {
    const packingList = await this.prisma.packing.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return response.status(200).send({ message: 'Get all packing data complete', data: packingList });
  } catch (error) {
    console.error('Error fetching packing list:', error);
    return response.status(500).send({ message: 'Internal server error' });
  } 

}

async updatepacking(id: string, dto: CreatePackingDto, request: any, response: any) {
  try {
    const existingPacking = await this.prisma.packing.findUnique({
      where: { packingID: id },
    });
    
    if (!existingPacking) {
      return response.status(404).send({ message: 'Packing not found' });
    }
    const updatedPacking = await this.prisma.packing.update({
      where: { packingID: id },
      data: dto,
    });
    return response.status(200).send({ message: 'Updated packing data complete', data: updatedPacking });
  }

  catch (error) {
    console.error('Error updating packing:', error);
    return response.status(500).send({ message: 'Internal server error' });
  }
}
}

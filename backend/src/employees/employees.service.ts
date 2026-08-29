import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { departmentId, positionId, ...employeeData } = createEmployeeDto;

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    if (!department.isActive) {
      throw new ConflictException(
        `Department with ID ${departmentId} is inactive`,
      );
    }

    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    if (!position.isActive) {
      throw new ConflictException(`Position with ID ${positionId} is inactive`);
    }

    return this.prisma.employee.create({
      data: {
        ...employeeData,
        department: {
          connect: { id: departmentId },
        },
        position: {
          connect: { id: positionId },
        },
      },
      include: {
        department: true,
        position: true,
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        position: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);

    const { departmentId, positionId, ...employeeData } = updateEmployeeDto;

    if (departmentId !== undefined) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
      }

      if (!department.isActive) {
        throw new ConflictException(
          `Department with ID ${departmentId} is inactive`,
        );
      }
    }

    if (positionId !== undefined) {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${positionId} not found`);
      }

      if (!position.isActive) {
        throw new ConflictException(
          `Position with ID ${positionId} is inactive`,
        );
      }
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        ...employeeData,
        ...(departmentId !== undefined && {
          department: {
            connect: { id: departmentId },
          },
        }),
        ...(positionId !== undefined && {
          position: {
            connect: { id: positionId },
          },
        }),
      },
      include: {
        department: true,
        position: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}

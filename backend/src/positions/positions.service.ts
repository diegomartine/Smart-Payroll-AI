import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    const existingPosition = await this.prisma.position.findUnique({
      where: {
        name: createPositionDto.name,
      },
    });

    if (existingPosition) {
      throw new ConflictException(
        `Position "${createPositionDto.name}" already exists`,
      );
    }

    return this.prisma.position.create({
      data: {
        name: createPositionDto.name,
        isActive: createPositionDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.position.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findActive() {
    return this.prisma.position.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {
    await this.findOne(id);

    if (updatePositionDto.name) {
      const existingPosition = await this.prisma.position.findFirst({
        where: {
          name: updatePositionDto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingPosition) {
        throw new ConflictException(
          `Position "${updatePositionDto.name}" already exists`,
        );
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.position.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}

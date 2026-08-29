import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.positionsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(Number(id), updatePositionDto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.positionsService.deactivate(Number(id));
  }
}

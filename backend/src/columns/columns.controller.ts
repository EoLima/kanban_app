import { Controller, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { AuthGuard } from '../auth.guard';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('api/columns')
@UseGuards(AuthGuard)
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto.title);
  }
}

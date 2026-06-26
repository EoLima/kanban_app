import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { AuthGuard } from '../auth.guard';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('api/cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  async create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto.columnId, dto.title, dto.details);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.cardsService.delete(id);
    return { success: true };
  }
}

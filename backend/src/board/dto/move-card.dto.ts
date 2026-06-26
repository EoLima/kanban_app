import { IsString, MinLength } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @MinLength(1)
  cardId: string;

  @IsString()
  @MinLength(1)
  targetColumnId: string;

  @IsString()
  @MinLength(1)
  sourceColumnId: string;

  targetIndex: number;
  sourceIndex: number;
}

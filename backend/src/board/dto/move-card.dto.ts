import { IsString, MinLength, IsInt, Min } from 'class-validator';

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

  @IsInt()
  @Min(0)
  targetIndex: number;

  @IsInt()
  @Min(0)
  sourceIndex: number;
}

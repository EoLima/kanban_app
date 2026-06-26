import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(1)
  columnId: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  details?: string;
}

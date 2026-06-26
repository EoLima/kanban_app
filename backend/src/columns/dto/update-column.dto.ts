import { IsString, MinLength } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @MinLength(1)
  title: string;
}

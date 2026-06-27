import { IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class ChatDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessageDto[];
}

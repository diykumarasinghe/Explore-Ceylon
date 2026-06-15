import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

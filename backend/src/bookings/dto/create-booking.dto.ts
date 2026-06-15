import { IsDateString, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  package: string;

  @IsDateString()
  travelDate: string;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  guestsCount: number;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

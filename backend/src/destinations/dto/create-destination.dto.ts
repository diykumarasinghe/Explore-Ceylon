import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  bestTimeToVisit?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

  @IsString()
  budgetRange: string;
}

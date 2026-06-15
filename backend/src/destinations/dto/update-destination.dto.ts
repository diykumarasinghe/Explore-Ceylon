import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDestinationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

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
  @IsOptional()
  budgetRange?: string;
}

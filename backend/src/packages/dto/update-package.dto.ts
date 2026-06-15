import { IsArray, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsMongoId()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @IsArray()
  @IsOptional()
  itinerary?: any[];
}

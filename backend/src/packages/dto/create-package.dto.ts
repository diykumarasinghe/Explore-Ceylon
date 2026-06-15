import { IsArray, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  title: string;

  @IsMongoId()
  destination: string;

  @IsString()
  description: string;

  @IsString()
  duration: string;

  @IsNumber()
  price: number;

  @IsString()
  image: string;

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

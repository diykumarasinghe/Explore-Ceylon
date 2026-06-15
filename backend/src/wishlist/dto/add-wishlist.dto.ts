import { IsMongoId, IsOptional } from 'class-validator';

export class AddWishlistDto {
  @IsMongoId()
  @IsOptional()
  package?: string;

  @IsMongoId()
  @IsOptional()
  packageId?: string;
}

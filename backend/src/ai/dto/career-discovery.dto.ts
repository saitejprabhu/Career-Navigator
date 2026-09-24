import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';

export class CareerDiscoveryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsObject()
  userProfile?: any;

  @IsOptional()
  @IsArray()
  availableRoles?: any[];
}

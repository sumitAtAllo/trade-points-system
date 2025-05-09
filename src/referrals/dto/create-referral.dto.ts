import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;
}
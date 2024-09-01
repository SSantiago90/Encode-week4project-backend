import { ApiProperty } from '@nestjs/swagger';

export class SelfDelegateToken {
  @ApiProperty({ type: String, required: true })
  address: string;
  /* 
  ! Delegate doesn't take an "Amount" as parammter
  @ApiProperty({ type: Number, required: true, default: '1' })
  amount: number; */
}

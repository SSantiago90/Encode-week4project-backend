import { ApiProperty } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty({ type: BigInt, required: true })
  proposalId: bigint;

  @ApiProperty({ type: Number, required: true })
  amount: number;
}

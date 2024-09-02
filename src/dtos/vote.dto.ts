import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({ description: 'Ethereum address of the voter' })
  address: string;

  @ApiProperty({ description: 'ID of the proposal being voted on' })
  proposalId: number;

  @ApiProperty({ description: 'Amount of token votes being cast' })
  amount: string;
}


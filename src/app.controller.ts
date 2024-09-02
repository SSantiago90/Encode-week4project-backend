import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegateToken } from './dtos/selfDelegateToken.dto';
import { CastVoteDto } from './dtos/castVote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): { result: string } {
    const getHelloResponse = this.appService.getHello();
    return { result: getHelloResponse};
  }

  @Get('contract-address')
  getContractAddress(): string {
    return this.appService.getContractAddress();
  }

  @Get('token-name')
  async getTokenName(): Promise<string> {
    return this.appService.getTokenName();
  }

  @Get('total-supply')
  async getTotalSupply(): Promise<string> {
    return this.appService.getTotalSupply();
  }

  @Get('token-balance')
  async getTokenBalance(@Query('address') address: string): Promise<string> {    
    return this.appService.getTokenBalance(address);
  }

  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string): Promise<string> {
    return this.appService.getTransactionReceipt(hash);
  }

  @Get('server-wallet-address')
  async getServerWalletAddress(): Promise<string> {
    return this.appService.getServerWalletAddress();
  }

  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string): Promise<boolean> {
    return this.appService.checkMinterRole(address);
  }

  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return { result: await this.appService.mintTokens(body) };    
  }

  @Post('delegate-tokens')
  async selfDelegateTokens(@Body() body: SelfDelegateToken): Promise<{}> {
    const response = await this.appService.selfDelegateTokens(body);
    return { result: response };
  }

  @Post('cast-vote')
  async castVote(@Body() body: CastVoteDto): Promise<{}> {
    const response = await this.appService.castVote(body);
    return { result: response };
  }
  
  // @Post('mint-tokens')
  // async mintTokens(@Body('address') address: string): Promise<string> {
  //   return this.appService.mintTokens(address);
  // }

  /*
  curl -X POST -H "Content-Type: application/json" -d '{"address":"0xb702E6E38E3831f3d0BD7F9e41566f8326526593", "amount": 1}' http://localhost:3001/mint-tokens

  {"result":{"result":true,"message":"Minted  1 tokens to 0xb702E6E38E3831f3d0BD7F9e41566f8326526593","transactionHash":"0xce53225f201ac68dc3f5682f07c9231be1820fa130376dd743a08c566c43d55f"}}%
  */

}

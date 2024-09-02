import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegateToken } from './dtos/selfDelegateToken.dto';
import { VoteDto } from './dtos/vote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // curl http://localhost:3001/hello
  @Get('hello')
  getHello(): { result: string } {
    const getHelloResponse = this.appService.getHello();
    return { result: getHelloResponse};
  }
// curl http://localhost:3001/contract-address
  @Get('contract-address')
  getContractAddress(): string {
    return this.appService.getContractAddress();
  }

  // curl http://localhost:3001/token-name
  @Get('token-name')
  async getTokenName(): Promise<string> {
    return this.appService.getTokenName();
  }

  // curl http://localhost:3001/total-supply
  @Get('total-supply')
  async getTotalSupply(): Promise<string> {
    return this.appService.getTotalSupply();
  }

  //  curl "http://localhost:3001/token-balance?address=0xYourAddressHere"
  @Get('token-balance')
  async getTokenBalance(@Query('address') address: string): Promise<string> {    
    return this.appService.getTokenBalance(address);
  }

// curl "http://localhost:3001/transaction-receipt?hash=0xTransactionHashHere"
  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string): Promise<string> {
    return this.appService.getTransactionReceipt(hash);
  }
// curl http://localhost:3001/server-wallet-address
  @Get('server-wallet-address')
  async getServerWalletAddress(): Promise<string> {
    return this.appService.getServerWalletAddress();
  }

  // X curl http://localhost:3001/check-minter-role
  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string): Promise<boolean> {
    return this.appService.checkMinterRole(address);
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0x0xYourAddressHere", "amount": 1}' http://localhost:3001/mint-tokens
  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return { result: await this.appService.mintTokens(body) };    
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0xYourAddressHere"}' http://localhost:3001/delegate-tokens
  @Post('delegate-tokens')
  async selfDelegateTokens(@Body() body: SelfDelegateToken): Promise<{}> {
    const response = await this.appService.selfDelegateTokens(body);
    return { result: response };
  }

  // curl -X POST -H "Content-Type: application/json" -d '{"address":"0xYourAddressHere", "proposalId":1}' http://localhost:3001/vote
  @Post('vote')
  async vote(@Body() body: VoteDto): Promise<{}> {
    const response = await this.appService.vote(body);
    return { result: response };
  }

}

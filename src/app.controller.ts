import { Controller, Get, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async final(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('phone') phone: string,
    @Query('searchby') searchBy?: 'email' | 'phone',
  ) {
    return await this.appService.final(name, email, phone, searchBy)
  }
}

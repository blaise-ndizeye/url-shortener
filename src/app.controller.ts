import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':shortUrl')
  @Redirect()
  goToOrginalUrl(
    @Param('shortUrl') shortUrl: string,
    @Query('ps') password?: string,
  ) {
    return this.appService.goToOriginalUrl(shortUrl, password);
  }
}

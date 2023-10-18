import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async goToOriginalUrl(shorlUrl: string, password?: string) {
    const hostname = process.env.HOSTNAME;
    let now = new Date();

    if (!hostname) {
      throw new NotImplementedException('INVALID HOSTNAME');
    }

    const urlToNavigate = await this.prismaService.url.findUnique({
      where: {
        short_url: shorlUrl,
      },
    });

    if (!urlToNavigate) {
      throw new NotFoundException();
    }

    if (urlToNavigate.expires_at < now) {
      throw new ForbiddenException('The url is expired');
    }

    if (urlToNavigate.is_password_protected) {
      if (!password) {
        throw new UnauthorizedException();
      }

      const isValidUrlPassword = await bcrypt.compare(
        password,
        urlToNavigate.password,
      );

      if (!isValidUrlPassword) {
        throw new UnauthorizedException();
      }
    }

    const createClick = this.prismaService.click.create({
      data: {
        url_id: urlToNavigate.id,
      },
    });

    const increaseClickNumber = this.prismaService.url.update({
      where: {
        id: urlToNavigate.id,
      },
      data: {
        number_of_clicks: urlToNavigate.number_of_clicks + 1,
      },
    });

    await Promise.all([createClick, increaseClickNumber]);

    return { url: urlToNavigate.original_url };
  }
}

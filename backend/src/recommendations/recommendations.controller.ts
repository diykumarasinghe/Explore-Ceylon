import { Controller, Get, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('personalized')
  async getPersonalized(@CurrentUser() user: UserDocument) {
    return this.recommendationsService.getPersonalized(user._id.toString());
  }

  @Get('trending')
  async getTrending() {
    return this.recommendationsService.getTrendingDestinations();
  }

  @Get('popular-packages')
  async getPopularPackages() {
    return this.recommendationsService.getPopularPackages();
  }
}

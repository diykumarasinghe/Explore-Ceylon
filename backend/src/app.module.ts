import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DestinationsModule } from './destinations/destinations.module';
import { PackagesModule } from './packages/packages.module';
import { BookingsModule } from './bookings/bookings.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TourGuidesModule } from './tour-guides/tour-guides.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    // Configurations
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),

    // Database Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        autoIndex: true,
      }),
    }),

    // Core & Feature Modules
    AuthModule,
    UsersModule,
    DestinationsModule,
    PackagesModule,
    BookingsModule,
    WishlistModule,
    ReviewsModule,
    AnalyticsModule,
    PaymentsModule,
    ReportsModule,
    RecommendationsModule,
    NotificationsModule,
    TourGuidesModule,
    MessagesModule,
  ],
})
export class AppModule {}

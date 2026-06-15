import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { getModelToken } from '@nestjs/mongoose';
import { seedDatabase } from './seed';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads and receipts directories exist
  const uploadsDir = path.resolve('./uploads');
  const receiptsDir = path.resolve('./uploads/receipts');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  // Serve static assets from uploads directory
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5174';

  // Auto-seed check
  try {
    const userModel = app.get(getModelToken('User'));
    const packageModel = app.get(getModelToken('Package'));
    const destinationModel = app.get(getModelToken('Destination'));

    const [userCount, packageCount, destCount] = await Promise.all([
      userModel.countDocuments().exec(),
      packageModel.countDocuments().exec(),
      destinationModel.countDocuments().exec(),
    ]);

    // Check if we need to update images from remote to local assets
    const firstDest = await destinationModel.findOne().exec();
    const hasRemoteImages = firstDest && firstDest.image && firstDest.image.startsWith('http');

    if (userCount === 0 || packageCount < 15 || destCount < 15 || hasRemoteImages) {
      console.log(`Database documents count is lower than expected or contains remote images. Running auto-seeding system...`);
      await seedDatabase(app);
    }
  } catch (err) {
    console.error('Auto-seeding check skipped/failed:', err.message);
  }

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      configService.get<string>('FRONTEND_URL'),
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);
  console.log(`Explore Ceylon backend listening on port ${port}...`);
}
bootstrap();
// Dev server reload trigger - run auto-seed

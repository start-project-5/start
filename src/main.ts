import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes will be prefixed with /api
  // Example: GET /api/guides, POST /api/bookings
  app.setGlobalPrefix('api');

  /**
   * ValidationPipe automatically validates every incoming request body
   * against the DTO decorators (IsString, IsEmail, Min, etc.)
   *
   * whitelist:            removes unknown fields not declared in the DTO
   * forbidNonWhitelisted: throws 400 if the client sends extra unknown fields
   * transform:            converts plain JSON objects into DTO class instances
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the frontend to call this API from a different origin
  app.enableCors();

    const swaggerConfig = new DocumentBuilder()
    .setTitle('City Tourism API')
    .setDescription(
      'REST API for a single-city tourism platform. ' +
      'Tourists can find guides, book tours, explore restaurants, hotels, attractions and more.',
    )
    .setVersion('1.0')
    .addBearerAuth() // adds the 🔒 Authorize button for JWT tokens
    .build();
 
  const document = SwaggerModule.createDocument(app, swaggerConfig);
 
  // First arg is the path where Swagger UI is served → /docs
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀  Server is running → http://localhost:${port}/api`);
  console.log("Documantation link: http://localhost:" + port + "/docs");
}

bootstrap();

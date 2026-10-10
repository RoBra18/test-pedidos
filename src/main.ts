import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Documentación: http://localhost:4001/api (JSON en /api-json)
  const config = new DocumentBuilder()
    .setTitle('examen-pedidos')
    .setDescription('Pedidos con control de stock (NestJS + SQL Server)')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);
  console.log(`examen-pedidos escuchando en http://localhost:${port} (Swagger en /api)`);
}
bootstrap();

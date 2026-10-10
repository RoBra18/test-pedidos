import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 1433)),
        username: config.get<string>('DB_USER', 'sa'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME', 'examen_pedidos'),
        autoLoadEntities: true,
        // El esquema se maneja con los scripts de db/, nunca desde el código.
        synchronize: false,
        options: { encrypt: false, trustServerCertificate: true },
      }),
    }),
    HealthModule,
    ProductosModule,
    // TODO: registra aquí tu PedidosModule.
  ],
})
export class AppModule {}

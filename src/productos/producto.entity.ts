import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Mapea la tabla dbo.productos creada por db/01-productos.sql.
@Entity({ name: 'productos' })
export class Producto {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'LAP-001' })
  @Column()
  sku: string;

  @ApiProperty({ example: 'Laptop 14 pulgadas' })
  @Column()
  nombre: string;

  @ApiProperty({ example: 5200.0 })
  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) },
  })
  precio: number;

  @ApiProperty({ example: 25 })
  @Column('int')
  stock: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CrearPedidoItemDto {

  @ApiProperty({
    description: 'ID único del producto',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productoId!: number;

  @ApiProperty({
    description: 'Cantidad de unidades solicitadas',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;
}
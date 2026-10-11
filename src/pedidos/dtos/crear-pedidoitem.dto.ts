import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CrearPedidoItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productoId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;
}
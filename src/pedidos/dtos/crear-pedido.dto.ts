import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
  Matches,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CrearPedidoItemDto } from './crear-pedidoitem.dto';

export class CrearPedidoDto {
  @IsString()
  @MaxLength(36)
  @IsNotEmpty( { message: 'clienteId no puede estar vacío' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  clienteId!: string;
  

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique(
    (item: CrearPedidoItemDto) => item.productoId,
    { message: 'No se permiten productos duplicados' },
  )
  @ValidateNested({ each: true })
  @Type(() => CrearPedidoItemDto)
  items!: CrearPedidoItemDto[];
}
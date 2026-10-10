import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPedidoItemDto } from './crear-pedidoitem.dto';

export class CrearPedidoDto {
  @IsString()
  @MaxLength(15)
  @Matches(/\S/, { message: 'clienteId no puede estar vacío' })
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
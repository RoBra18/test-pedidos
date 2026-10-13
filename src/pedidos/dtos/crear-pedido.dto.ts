import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CrearPedidoItemDto } from './crear-pedidoitem.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPedidoDto {

  @ApiProperty({
    description: 'Identificador del cliente',
    example: 'cli_12345',
    maxLength: 36,
  })
  @IsString()
  @MaxLength(36)
  @IsNotEmpty({ message: 'clienteId no puede estar vacío' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  clienteId!: string;

  @ApiProperty({
    description: 'Detalle de los items incluidos en el pedido',
    type: () => [CrearPedidoItemDto],
  })
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
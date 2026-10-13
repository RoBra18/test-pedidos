import { ApiProperty } from "@nestjs/swagger";
import { Pedido } from "../entities/pedido.entity";
import { EstadoPedidoTexto } from "../enums/estado-pedido.enum";

export class PedidoRespuestaItemDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 1,
  })
  productoId!: number;

  @ApiProperty({
    description: 'Cantidad de unidades ordenadas',
    example: 2,
  })
  cantidad!: number;

  @ApiProperty({
    description: 'Precio unitario del producto al momento de la compra',
    example: 15.5,
  })
  precioUnitario!: number;

  @ApiProperty({
    description: 'Subtotal calculado para este item (cantidad * precioUnitario)',
    example: 31.0,
  })
  subtotal!: number;
}

export class PedidoRespuestaDto {
  @ApiProperty({
    description: 'ID autogenerado del pedido',
    example: 10,
  })
  id!: number;

  @ApiProperty({
    description: 'Identificador del cliente asociado',
    example: 'cli_12345',
  })
  clienteId!: string;

  @ApiProperty({
    description: 'Estado actual del pedido',
    example: 'CREADO',
  })
  estado!: string;

  @ApiProperty({
    description: 'Monto total acumulado del pedido',
    example: 31.0,
  })
  total!: number;

  @ApiProperty({
    description: 'Fecha y hora de creación en formato ISO 8601',
    example: '2026-03-30T15:20:00.000Z',
  })
  creadoEn!: string;

  @ApiProperty({
    description: 'Detalle de los items incluidos en el pedido',
    type: () => [PedidoRespuestaItemDto],
  })
  items!: PedidoRespuestaItemDto[];

  static desdeEntidad(pedido: Pedido): PedidoRespuestaDto {
    return {
      id: pedido.id,
      clienteId: pedido.clienteId,
      estado: EstadoPedidoTexto[pedido.estado],
      creadoEn: pedido.creadoEn.toISOString(),
      total: Number(pedido.total),
      items: (pedido.detalles || []).map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: Number(detalle.precioUnitario),
        subtotal: Number(
          detalle.subtotal ??
          (detalle.cantidad * Number(detalle.precioUnitario)).toFixed(2),
        ),
      })),
    };
  }
}

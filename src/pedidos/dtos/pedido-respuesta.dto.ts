import { Pedido } from "../entities/pedido.entity";
import { EstadoPedidoTexto } from "../enums/estado-pedido.enum";

export class PedidoRespuestaItemDto {
  productoId!: number;
  cantidad!: number;
  precioUnitario!: number;
  subtotal!: number;
}

export class PedidoRespuestaDto {
  id!: number;
  clienteId!: string;
  estado!: string;
  total!: number;
  creadoEn!: string;
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





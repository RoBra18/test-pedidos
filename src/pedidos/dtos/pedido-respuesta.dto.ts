
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
}

export enum EstadoPedido {
  CREADO = 1,
}

export const EstadoPedidoTexto: Record<EstadoPedido, string> = {
  [EstadoPedido.CREADO]: 'CREADO',
};
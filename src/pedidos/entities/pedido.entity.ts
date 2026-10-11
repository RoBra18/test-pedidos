import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PedidoDetalle } from './pedido-detalle.entity';
import { EstadoPedido } from '../enums/estado-pedido.enum';

@Entity({ name: 'pedidos' })
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 36 })
  clienteId!: string;

  @Column({ type: 'tinyint', default: EstadoPedido.CREADO })
  estado!: EstadoPedido;

  @Column({ type: 'datetime2', precision: 0, default: () => 'SYSDATETIME()' })
  creadoEn!: Date;

  @Column({ type: 'datetime2', precision: 0, nullable: true })
  actualizadoEn!: Date | null;

  @Column({ type: 'datetime2', precision: 0, nullable: true })
  eliminadoEn!: Date | null;

  @Column({ type: 'bit', default: false })
  estaEliminado!: boolean;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string | number) => Number(v),
    },
  })
  total!: number;

  @OneToMany(()=> PedidoDetalle, (detalle) => detalle.pedido, {
    cascade: true
  })
  detalles! : PedidoDetalle[];
}
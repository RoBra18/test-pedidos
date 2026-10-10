import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pedidos' })
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 15 })
  clienteId!: string;

  @Column({ type: 'tinyint', default: 1 })
  estado!: number;

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
}
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'pedido_detalle' })
export class PedidoDetalle {
    @PrimaryColumn({ type: 'int' })
    pedidoId!: number;

    @PrimaryColumn({ type: 'int' })
    productoId!: number;

    @Column({ type: 'int' })
    cantidad!: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (v: number) => v,
            from: (v: string | number) => Number(v),
        },
    })
    precioUnitario!: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        insert: false,
        update: false,
        select: true,
    })
    subtotal!: number;
}
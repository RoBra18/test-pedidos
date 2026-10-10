import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productos: Repository<Producto>,
  ) {}

  listar(): Promise<Producto[]> {
    return this.productos.find({ order: { id: 'ASC' } });
  }

  async obtener(id: number): Promise<Producto> {
    const producto = await this.productos.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto ${id} no existe`);
    }
    return producto;
  }
}

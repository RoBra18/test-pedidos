# Decisiones

> Completa este archivo con tus propias palabras. Media página alcanza. En la entrevista te pediremos que expliques cada punto.
### Se decidió mantener el código en español, debido a que el proyecto base se encontraba en ese idioma

## Diseño de las tablas

Se crearon dos tablas principales. La tabla de PEDIDOS y la tabla PEDIDOS-DETALLE. Para eso, se creo un archivo SQL para cada uno para realizar la creación cuando corresponda. 

Ambas tablas contienen en escencia los datos que se requerían tanto de entrada como de salida. Sin embargo, también en la tabla de pedidos se añadieron campos básicos de auditoría, como la fecha de actualización, eliminación, y una flag para determinar si está activo o no.

Para la tabla de Pedidos se está utilizando un id de tipo INT autoincremental, siguiendo la convención establecida por la tabla productos. Podría considerarse utilizar un tipo de dato UUID ya que suele ser lo más utilizado en los nuevos días debido a sus beneficios de unicidad.

Para la tabla de PedidoDetalle, se está utilizando cono llaves primarias tanto el "pedidoId" como el "productoId". Esta clave primaria/foránea compuesta garantiza la unicidad ya que se sabe que no puede aparecer dos veces un producto en un pedido. Existe la alternativa de que esta tabla tenga su propio ID autoincremental, sin embargo con el objetivo de ahorrar espacio y almacenamiento, se decidió el enfoque descrito.

Pedido y PedidoDetalle tienen una relación de "uno a muchos", donde un pedido tiene muchos detalles (cada detalle especifica el prdocuto, la cantidad y el precio del producto en ESE MOMENTO.)

A diferencia del módulo de productos, se decidió separar , en el módulo de pedidos, las entidades y los DTOS. LAs entidades representan la estructura en la BDD y los dtos la estructura de entrada/salida. 

Cada entidad tiene su respectiva relación con la otra utilizando @ManyToOne y @OneToMany: 

```typescript
 @OneToMany(()=> PedidoDetalle, (detalle) => detalle.pedido, {
    cascade: true
  })
  detalles! : PedidoDetalle[];
  ```

## Cómo evitas vender de más con pedidos simultáneos

La principal forma de evitar la venta de productos sin stock cuando existe concurrencia, fue el manejo de transacciones con 
un bloqueo pesimista. "pessimistic_write". Con esta estrategia, bloqueamos los productos que estamos consultando mientras dure la transacción en la que se encuentra nuestro programa. Además, se ordenan los productos por su id para evitar bloqueos accidentales entre peticiones, o bloqueos infinitos entre pedidos.

Se decidió esta estrategia en base a un análisis realizado comparando con otras alternativas, como un bloqueo optimista, donde no se atienden las peticiones de forma odernada, también se consideró utilizar una restricción (CHECK STOCK >= 0)
en la BDD, sin embargo haría que la BDD devuelva un error interno el cual podríamos coordinar nosotros.

También se consideraron alternativas de uso de colas, para procesar los pedidos de forma asíncrona, sin embargo llegaría a ser algo complementario, tal vez no tan necesario y llegaría a cambiar el contrato de la API ya que se tendría que procesar el pedido de forma asíncrona. 

## Manejo de errores

<!-- ¿Cómo decides qué código HTTP devolver? ¿Qué pasa si la base falla a mitad del pedido? -->

Para el manejo de errores, por simplicidad se están utilizando las excepciones semánticas de NestJS para que se responda
con el código HTTP que corresponda. Además, para cumplir con el contrato, se verificó que cada excepción coincida con lo
requerido y con los estándares generales de errores.

En el caso del fallo de la BDD a mitad de un pedido, el pedido no será registrado ya que, como se explicó anteriormente, todo el pedido se realiza utilizando una transacción, entonces si llega a haber un fallo, se realizará un rollback retornando 500.

Podría mejorarse todo con un manejador de errores global sin embargo por cuestiones d esimplicidad y tiempo se mantuvo así.

## Cómo probaste tu solución

<!-- ¿Qué pruebas escribiste y qué demuestran? -->

He escrito una prueba de punta a punta e2e donde se simulan 5 peticiones concurrentes simultáneas utilizando Promise.all.
CAda petición requiere 3 unidades de un producto (15 en total) de un producto que solo tiene 10 unidades.

Se semuestra que se evita la sobreventa, verificando que solo se procesen exitosamente 3 pedidos, se rechazen 2 y quede una unidad en stock.

## Uso de IA

<!-- ¿Usaste IA? ¿Para qué partes? ¿Qué tuviste que corregir o cambiar de lo que te sugirió? -->

Se utilizó IA para investigar las estrategias de control de concurrencia más comunes, hacer una comparación y pedir implementaciones de ejemplo. Se decidió no utilizar agentes de código con el objetivo de tener más control sobre el proyecto. 

Una cosa que tuve que corregir es la consulta y el bloqueo de los productos, ya que inicialmente bloqueaba uno por uno lo cual no era eficiente, por lo que se tuvo que cambiar a otra sintaxis usando "IN" de SQL.

```typescript
for (const item of items) {
  const producto = await manager
    .getRepository(Producto)
    .createQueryBuilder('producto')
    .setLock('pessimistic_write')
    .where('producto.id = :id', { id: item.productoId })
    .getOne();
  // ...
}
```
### Se cambió por:

```typescript
const productos = await manager
  .getRepository(Producto)
  .createQueryBuilder('producto')
  .setLock('pessimistic_write')
  .where('producto.id IN (:...ids)', { ids: idsOrdenados })
  .orderBy('producto.id', 'ASC')
  .getMany();
```


## Qué mejorarías con más tiempo

<!-- Opcional. -->
Haría las siguientes mejoras:
- Añadiría una capa de abstracción de acceso de datos, similar al "Repository" en C# para aislar el acceso a datos y que no exista acoplamiento
- Añadiría una forma mejorada de manejo de errores, para que el servicio no devuelva directamente errores HTTP y bajar el acoplamiento

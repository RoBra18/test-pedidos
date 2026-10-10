# Examen práctico 1 de 3 — Pedidos con control de stock (SQL Server)

Este es uno de los **tres repositorios** del examen práctico para el puesto de **Desarrollador Backend Junior**. Los otros dos son [`hcrm-examen-visitas`](https://github.com/hansa-examenes/hcrm-examen-visitas) (MongoDB) y [`hcrm-examen-cache`](https://github.com/hansa-examenes/hcrm-examen-cache) (Redis).

## Reglas generales (iguales para los 3 repositorios)

- **Stack obligatorio: NestJS + TypeScript.** El esqueleto ya está armado; construye sobre él.
- **Puedes usar IA** (ChatGPT, Claude, Copilot, etc.), documentación y cualquier recurso. No es trampa: es como se trabaja hoy.
- **Pero tendrás que defender tu solución** en una entrevista técnica: explicar cada decisión, responder preguntas sobre tu código y **hacer un cambio pequeño en vivo**. Si no entiendes lo que entregaste, se va a notar.
- **No cambies el contrato de la API** (rutas, códigos HTTP, formato de entrada y salida). Revisaremos tu entrega con pruebas automáticas que dependen de ese contrato.
- **Haz commits pequeños y frecuentes.** El historial es parte de la evaluación: queremos ver cómo avanzaste, no solo el resultado.
- **Completa `DECISIONES.md`** con las decisiones que tomaste y por qué (media página alcanza).
- **Tiempo estimado:** entre 1 y 2 horas por repositorio.

### Entrega

1. **Crea tu copia con "Use this template"** (botón verde arriba a la derecha → *Create a new repository*). **No hagas fork.**
   - *Owner:* tu cuenta de GitHub. *Repository name:* el mismo nombre de este repositorio.
   - *Visibility:* **Private**.
2. **Invita a `Sergio-Al` como colaborador** en cada repositorio: *Settings → Collaborators → Add people*.
3. Trabaja en tu repositorio y sube tus commits (`git push`) a medida que avanzas.
4. **Responde el correo del examen con los 3 enlaces** antes de la fecha y hora indicadas. Evaluaremos el último commit subido antes de ese correo.

## Requisitos

- Node.js 20 o superior
- Docker Desktop (o Docker Engine + Compose). SQL Server necesita unos **2 GB de RAM** libres.
- En Mac con Apple Silicon (M1/M2/M3): activa en Docker Desktop la opción *"Use Rosetta for x86_64/amd64 emulation"*; la imagen de SQL Server solo existe para amd64.

## Cómo levantar el proyecto

```bash
cp .env.example .env
npm install
npm run db:up        # levanta SQL Server y crea la base con datos de prueba
npm run start:dev    # API en http://localhost:4001
```

La documentación interactiva de la API (Swagger) queda en **http://localhost:4001/api**.

Comprueba que todo funciona:

```bash
curl http://localhost:4001/health      # {"status":"ok","db":"up"}
curl http://localhost:4001/productos   # lista de productos de prueba
```

- `npm run db:reset` borra la base y la vuelve a crear desde cero (útil para repetir pruebas).
- Al levantar el compose se ejecutan, en orden alfabético, **todos** los archivos `db/*.sql`. Crea tus tablas en un archivo nuevo (por ejemplo `db/02-pedidos.sql`) y escríbelo de forma **idempotente** (`IF OBJECT_ID(...) IS NULL ...`), porque se ejecuta cada vez.
- TypeORM está configurado con `synchronize: false`: el esquema se define en SQL, no se genera desde las entidades.

## Qué ya está hecho

| Ruta | Descripción |
|---|---|
| `GET /health` | Verifica la conexión a la base |
| `GET /api` | Documentación Swagger (el JSON está en `/api-json`) |
| `GET /productos` | Lista los productos |
| `GET /productos/:id` | Obtiene un producto (404 si no existe) |

Úsalos como referencia de estilo. La tabla `dbo.productos` y sus datos están en `db/01-productos.sql`; **no la modifiques**.

## Qué tienes que construir

Una tienda recibe pedidos desde varias cajas al mismo tiempo. Cada pedido descuenta stock de los productos. **El problema central:** nunca se debe vender más unidades de las que hay en stock, aunque lleguen muchos pedidos simultáneos por el mismo producto.

### 1. `POST /pedidos` — crear un pedido

Petición:

```json
{
  "clienteId": "CLI-001",
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 4, "cantidad": 1 }
  ]
}
```

Respuesta **201 Created**:

```json
{
  "id": 1,
  "clienteId": "CLI-001",
  "estado": "CREADO",
  "total": 10550.75,
  "creadoEn": "2026-10-09T14:30:00.000Z",
  "items": [
    { "productoId": 1, "cantidad": 2, "precioUnitario": 5200.00, "subtotal": 10400.00 },
    { "productoId": 4, "cantidad": 1, "precioUnitario": 150.75, "subtotal": 150.75 }
  ]
}
```

Reglas:

- El precio unitario se toma de la tabla `productos` **en el momento del pedido** y queda guardado en el pedido (si el precio cambia después, el pedido no cambia).
- El pedido es **todo o nada**: si un solo producto no tiene stock suficiente, no se crea el pedido y **no se descuenta stock de ningún producto**.
- **Bajo concurrencia no se puede vender de más.** Si el producto `LIMITADO-10` (10 unidades) recibe 20 pedidos simultáneos de 1 unidad, deben crearse exactamente 10 pedidos, los otros 10 deben fallar con 409, y el stock final debe quedar en 0.

Errores:

| Código | Cuándo |
|---|---|
| 400 | Body inválido: `clienteId` vacío, `items` vacío, `cantidad` no entera o menor que 1, o el mismo `productoId` repetido en `items` |
| 404 | Algún `productoId` no existe |
| 409 | Stock insuficiente para algún producto. El mensaje debe indicar cuál |

### 2. `GET /pedidos/:id` — consultar un pedido

Devuelve el pedido con el mismo formato que la respuesta de creación, o **404** si no existe.

### 3. Una prueba automática de la concurrencia

Agrega al menos una prueba (unitaria o e2e en `test/`) que demuestre que no se vende de más con pedidos simultáneos. Puede asumir que la base de Docker está levantada.

### 4. Documentación en Swagger

Tus endpoints deben quedar documentados en Swagger: DTOs de entrada con `@ApiProperty`, y las respuestas y errores principales con `@ApiOkResponse`, `@ApiNotFoundResponse`, etc. Los endpoints que ya vienen hechos muestran cómo.

## Qué evaluamos

- Que el contrato se cumpla y que **no se venda de más bajo concurrencia** (lo más importante).
- Diseño de las tablas de pedidos: claves, tipos de datos, relaciones.
- Uso correcto de transacciones y manejo de errores (códigos HTTP correctos, sin 500 por errores esperables).
- Código ordenado: controlador → servicio → acceso a datos, DTOs con validación.
- La documentación de tu API en Swagger.
- `DECISIONES.md` y el historial de commits.

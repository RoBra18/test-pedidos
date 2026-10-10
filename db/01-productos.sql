-- Esquema base y datos de prueba. No modificar: los scripts de evaluación dependen de estos datos.
-- Para tus propias tablas crea db/02-<algo>.sql (idempotente).

IF DB_ID('examen_pedidos') IS NULL
    CREATE DATABASE examen_pedidos;
GO

USE examen_pedidos;
GO

IF OBJECT_ID('dbo.productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.productos (
        id      INT IDENTITY(1,1) PRIMARY KEY,
        sku     NVARCHAR(50)   NOT NULL UNIQUE,
        nombre  NVARCHAR(200)  NOT NULL,
        precio  DECIMAL(12, 2) NOT NULL,
        stock   INT            NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.productos)
BEGIN
    INSERT INTO dbo.productos (sku, nombre, precio, stock) VALUES
        ('LAP-001',     N'Laptop 14 pulgadas',           5200.00,  25),
        ('MON-002',     N'Monitor 24 pulgadas',          1350.50,  40),
        ('TEC-003',     N'Teclado mecánico',              420.00, 100),
        ('MOU-004',     N'Mouse inalámbrico',             150.75, 200),
        ('LIMITADO-10', N'Edición limitada (10 unidades)', 999.99,  10),
        ('AGOTADO-0',   N'Producto agotado',               80.00,   0);
END
GO

# Ferretería Copacabana — Sistema de Gestión e Inventario

Sistema para administrar productos, inventario, ventas, compras, clientes, proveedores, empleados y pagos.
Backend en **Java 17 + Spring Boot 3**, base de datos **H2** (archivo local) y frontend en HTML/JS servido por el mismo proyecto.

## Cómo ejecutarlo

Requisitos: JDK 17 o superior y Maven (o abre el proyecto en IntelliJ / VS Code / Eclipse).

```bash
mvn spring-boot:run
```

Abre http://localhost:8080

| Usuario    | Contraseña    | Rol       |
|------------|---------------|-----------|
| `admin`    | `admin123`    | ADMIN     |
| `empleado` | `empleado123` | EMPLEADO  |

Los usuarios y algunos productos de ejemplo se crean automáticamente la primera vez (con la contraseña ya cifrada con BCrypt).
Si algo sale mal con los datos, borra la carpeta `data/` y vuelve a ejecutar.

## Actores
- **Administrador**: acceso total (incluye gestión de empleados).
- **Empleado**: ventas, clientes, consulta de stock, pagos.

## Módulos
Autenticación · Empleados · Clientes · Proveedores · Categorías · Productos · Inventario (alertas de stock mínimo) · Compras · Ventas · Pagos (efectivo, tarjeta, transferencia) · Reportes (totales, más vendidos).

## Estructura
```
src/main/java/com/ferreteria/copacabana
├── config/       Seguridad (Spring Security + BCrypt), carga inicial de datos
├── controller/   API REST (/api/...)
├── model/        Entidades JPA
├── repository/   Spring Data JPA
└── service/      Lógica de ventas y compras (actualiza stock)
src/main/resources
├── application.properties
└── static/       Frontend (index.html, app.js, style.css)
```

## Cambiar a PostgreSQL
Agrega la dependencia `org.postgresql:postgresql` al `pom.xml` y descomenta las líneas de ejemplo en `application.properties`.

## Licencia
MIT

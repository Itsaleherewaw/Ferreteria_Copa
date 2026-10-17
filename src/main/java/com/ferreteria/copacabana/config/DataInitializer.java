package com.ferreteria.copacabana.config;

import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/** Crea usuarios y datos de ejemplo la primera vez que se arranca (contraseñas ya con BCrypt). */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final EmpleadoRepository empleados;
    private final CategoriaRepository categorias;
    private final ProductoRepository productos;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (empleados.count() == 0) {
            empleados.save(empleado("Administrador", "admin", "admin123", Rol.ADMIN));
            empleados.save(empleado("Empleado de ventas", "empleado", "empleado123", Rol.EMPLEADO));
        }
        if (categorias.count() == 0) {
            Categoria herr = categoria("Herramientas");
            Categoria elec = categoria("Electricidad");
            Categoria plom = categoria("Plomería");
            productos.save(producto("H-001", "Martillo 16 oz", herr, "35", "55", 20, 5));
            productos.save(producto("H-002", "Destornillador plano", herr, "8", "15", 40, 10));
            productos.save(producto("E-001", "Cable eléctrico 2.5mm (m)", elec, "4", "7", 200, 50));
            productos.save(producto("P-001", "Tubo PVC 1/2 pulgada", plom, "12", "20", 3, 10));
        }
    }

    private Empleado empleado(String nombre, String usuario, String pass, Rol rol) {
        Empleado e = new Empleado();
        e.setNombre(nombre);
        e.setUsuario(usuario);
        e.setPassword(encoder.encode(pass));
        e.setRol(rol);
        return e;
    }

    private Categoria categoria(String nombre) {
        Categoria c = new Categoria();
        c.setNombre(nombre);
        return categorias.save(c);
    }

    private Producto producto(String cod, String nom, Categoria cat, String pc, String pv, int stock, int min) {
        Producto p = new Producto();
        p.setCodigo(cod);
        p.setNombre(nom);
        p.setCategoria(cat);
        p.setPrecioCompra(new BigDecimal(pc));
        p.setPrecioVenta(new BigDecimal(pv));
        p.setStock(stock);
        p.setStockMinimo(min);
        return p;
    }
}

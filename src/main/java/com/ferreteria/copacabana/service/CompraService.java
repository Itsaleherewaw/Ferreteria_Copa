package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {
    private final CompraRepository compras;
    private final ProductoRepository productos;
    private final ProveedorRepository proveedores;

    public record Item(Long productoId, Integer cantidad, BigDecimal costoUnitario) {}
    public record Req(Long proveedorId, List<Item> items) {}

    @Transactional
    public Compra crear(Req req) {
        if (req.items() == null || req.items().isEmpty())
            throw new IllegalArgumentException("La compra no tiene productos");

        Compra c = new Compra();
        if (req.proveedorId() != null)
            c.setProveedor(proveedores.findById(req.proveedorId())
                    .orElseThrow(() -> new IllegalArgumentException("El proveedor no existe")));

        BigDecimal total = BigDecimal.ZERO;
        for (Item it : req.items()) {
            if (it.cantidad() == null || it.cantidad() <= 0)
                throw new IllegalArgumentException("Cantidad inválida");
            Producto p = productos.findById(it.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("El producto no existe"));
            BigDecimal costo = it.costoUnitario() != null ? it.costoUnitario() : p.getPrecioCompra();
            p.setStock(p.getStock() + it.cantidad());
            p.setPrecioCompra(costo);

            DetalleCompra d = new DetalleCompra();
            d.setProducto(p);
            d.setCantidad(it.cantidad());
            d.setCostoUnitario(costo);
            d.setSubtotal(costo.multiply(BigDecimal.valueOf(it.cantidad())));
            c.getDetalles().add(d);
            total = total.add(d.getSubtotal());
        }
        c.setTotal(total);
        return compras.save(c);
    }
}

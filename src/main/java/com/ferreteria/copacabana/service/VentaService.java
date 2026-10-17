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
public class VentaService {
    private final VentaRepository ventas;
    private final ProductoRepository productos;
    private final ClienteRepository clientes;
    private final EmpleadoRepository empleados;
    private final PagoRepository pagos;

    public record Item(Long productoId, Integer cantidad) {}
    public record Req(Long clienteId, MetodoPago metodoPago, List<Item> items) {}

    @Transactional
    public Venta crear(Req req, String usuario) {
        if (req.items() == null || req.items().isEmpty())
            throw new IllegalArgumentException("La venta no tiene productos");

        Venta v = new Venta();
        if (req.clienteId() != null)
            v.setCliente(clientes.findById(req.clienteId())
                    .orElseThrow(() -> new IllegalArgumentException("El cliente no existe")));
        v.setEmpleado(empleados.findByUsuario(usuario).orElse(null));
        v.setMetodoPago(req.metodoPago() == null ? MetodoPago.EFECTIVO : req.metodoPago());

        BigDecimal total = BigDecimal.ZERO;
        for (Item it : req.items()) {
            if (it.cantidad() == null || it.cantidad() <= 0)
                throw new IllegalArgumentException("Cantidad inválida");
            Producto p = productos.findById(it.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("El producto no existe"));
            if (p.getStock() < it.cantidad())
                throw new IllegalArgumentException("Stock insuficiente de " + p.getNombre()
                        + " (disponible: " + p.getStock() + ")");
            p.setStock(p.getStock() - it.cantidad());

            DetalleVenta d = new DetalleVenta();
            d.setProducto(p);
            d.setCantidad(it.cantidad());
            d.setPrecioUnitario(p.getPrecioVenta());
            d.setSubtotal(p.getPrecioVenta().multiply(BigDecimal.valueOf(it.cantidad())));
            v.getDetalles().add(d);
            total = total.add(d.getSubtotal());
        }
        v.setTotal(total);
        v = ventas.save(v);

        Pago pago = new Pago();
        pago.setVentaId(v.getId());
        pago.setMetodo(v.getMetodoPago());
        pago.setMonto(total);
        pagos.save(pago);
        return v;
    }
}

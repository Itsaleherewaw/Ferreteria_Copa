package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController extends CrudController<Producto> {
    private final ProductoRepository repository;

    @Override
    protected JpaRepository<Producto, Long> repo() {
        return repository;
    }
}

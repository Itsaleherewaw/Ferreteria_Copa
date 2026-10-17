package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Proveedor;
import com.ferreteria.copacabana.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController extends CrudController<Proveedor> {
    private final ProveedorRepository repository;

    @Override
    protected JpaRepository<Proveedor, Long> repo() {
        return repository;
    }
}

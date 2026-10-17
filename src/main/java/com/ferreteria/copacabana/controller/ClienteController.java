package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Cliente;
import com.ferreteria.copacabana.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController extends CrudController<Cliente> {
    private final ClienteRepository repository;

    @Override
    protected JpaRepository<Cliente, Long> repo() {
        return repository;
    }
}

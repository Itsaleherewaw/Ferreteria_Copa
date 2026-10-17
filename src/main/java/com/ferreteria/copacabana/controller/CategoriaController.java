package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Categoria;
import com.ferreteria.copacabana.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController extends CrudController<Categoria> {
    private final CategoriaRepository repository;

    @Override
    protected JpaRepository<Categoria, Long> repo() {
        return repository;
    }
}

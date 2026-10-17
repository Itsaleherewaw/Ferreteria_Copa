package com.ferreteria.copacabana.config;

import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final EmpleadoRepository repo;

    @Override
    public UserDetails loadUserByUsername(String usuario) throws UsernameNotFoundException {
        Empleado e = repo.findByUsuario(usuario.trim())
                .orElseThrow(() -> new UsernameNotFoundException(usuario));
        return User.withUsername(e.getUsuario())
                .password(e.getPassword())
                .roles(e.getRol().name())
                .disabled(!e.isActivo())
                .build();
    }
}

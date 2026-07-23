package com.ecommerce.api.services;

import com.ecommerce.api.config.JwtUtils;
import com.ecommerce.api.dto.LoginDTO;
import com.ecommerce.api.dto.ProfileDTO;
import com.ecommerce.api.dto.RegisterDTO;
import com.ecommerce.api.entities.*;
import com.ecommerce.api.repositories.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthUserServices {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RoleRepository roleRepository;

    @Transactional
    public String createUser(RegisterDTO user) {
        if (user.getPassword().length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }

        if (!user.getEmail().contains("@") || !user.getEmail().contains(".")) {
            throw new IllegalArgumentException("El formato del correo no es válido");
        }

        if (!user.getPassword().equals(user.getConfirmPassword())) {
            throw new RuntimeException("Las contraseñas deben ser iguales");
        }

        if (authUserRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Este email ya esta registrado");
        }

        if (authUserRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Este username ya esta registrado");
        }

        Role defaultRole = roleRepository.findByNameRole("USER")
                .orElseThrow(() -> new RuntimeException("El rol USER no existe en la base de datos"));

        String hashedPassword = passwordEncoder.encode(user.getPassword());

        AuthUser authUser = new AuthUser();
        authUser.setUsername(user.getUsername());
        authUser.setPassword(hashedPassword);
        authUser.setEmail(user.getEmail());
        authUser.setRole(defaultRole);

        AuthUser savedAuth = authUserRepository.save(authUser);

        Users newUser = new Users();
        newUser.setName(user.getName_user());
        newUser.setRut(user.getRut());
        newUser.setAddress(user.getAddress());
        newUser.setPhone(user.getPhone());
        newUser.setAuthUser(savedAuth);

        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate coordinate = new Coordinate(user.getLongitud(), user.getLatitud());
        Point userLocation = geometryFactory.createPoint(coordinate);
        newUser.setLocation(userLocation);

        Users savedUser = userRepository.save(newUser);

        Warehouse initialWarehouse = new Warehouse();
        String warehouseName = savedUser.getName() + " - Casa Matriz";
        initialWarehouse.setName(warehouseName);
        initialWarehouse.setAddress(savedUser.getAddress());
        initialWarehouse.setLocation(userLocation);
        initialWarehouse.setUser(savedUser);
        warehouseRepository.save(initialWarehouse);

        ShoppingCart initialCart = new ShoppingCart();
        initialCart.setUser(savedUser);
        shoppingCartRepository.save(initialCart);

        return "Usuario registrado con exito";
    }

    public String loginUser(LoginDTO login) {
        AuthUser authUser = authUserRepository.findByUsernameOrEmail(login.getIdentifier(), login.getIdentifier())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (passwordEncoder.matches(login.getPassword(), authUser.getPassword())) {
            Users user = userRepository.findByAuthUser(authUser)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return jwtUtils.generateToken(authUser, user.getIdUser());
        } else {
            throw new RuntimeException("Contraseña incorrecta");
        }
    }

    public List<ProfileDTO> getAllProfiles() {
        List<Users> users = userRepository.findAll();

        return users.stream().map(u -> new ProfileDTO(
                u.getIdUser(),
                u.getAuthUser().getUsername(),
                u.getAuthUser().getEmail(),
                u.getName(),
                u.getRut(),
                u.getAddress(),
                u.getPhone()
        )).collect(Collectors.toList());
    }
}
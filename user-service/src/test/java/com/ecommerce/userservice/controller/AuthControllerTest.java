package com.ecommerce.userservice.controller;

import com.ecommerce.userservice.dto.LoginRequest;
import com.ecommerce.userservice.dto.RegisterRequest;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;
import com.ecommerce.userservice.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id("u1")
                .username("testuser")
                .email("test@example.com")
                .password("encoded_pass")
                .roles(Set.of("ROLE_USER"))
                .build();
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn("encoded_new");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUser_UsernameAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testAuthenticateUser_Success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        Authentication auth = mock(Authentication.class);
        org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User("testuser", "password123", java.util.Collections.emptyList());
        when(auth.getPrincipal()).thenReturn(springUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken("testuser")).thenReturn("mock.jwt.token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));

        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}

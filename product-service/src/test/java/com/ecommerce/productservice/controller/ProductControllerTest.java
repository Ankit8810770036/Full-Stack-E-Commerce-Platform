package com.ecommerce.productservice.controller;

import com.ecommerce.productservice.dto.StockDecrementRequest;
import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.model.Review;
import com.ecommerce.productservice.repository.ProductRepository;
import com.ecommerce.productservice.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductController productController;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id("p100")
                .name("Noise Pulse Smartwatch")
                .description("Bluetooth calling smartwatch")
                .price(new BigDecimal("1799.00"))
                .category("Electronics")
                .stock(25)
                .imageUrl("https://example.com/watch.jpg")
                .build();
    }

    @Test
    void testGetAllProducts() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct));

        ResponseEntity<List<Product>> response = productController.getAllProducts(null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Noise Pulse Smartwatch", response.getBody().get(0).getName());
    }

    @Test
    void testGetProductById_Found() {
        when(productRepository.findById("p100")).thenReturn(Optional.of(sampleProduct));

        ResponseEntity<?> response = productController.getProductById("p100");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Product);
        assertEquals("p100", ((Product) response.getBody()).getId());
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById("p999")).thenReturn(Optional.empty());

        ResponseEntity<?> response = productController.getProductById("p999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testDecrementStock_Success() {
        when(productRepository.findById("p100")).thenReturn(Optional.of(sampleProduct));

        StockDecrementRequest req = new StockDecrementRequest("p100", 2);
        ResponseEntity<?> response = productController.decrementStock(List.of(req));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(23, sampleProduct.getStock());
        verify(productRepository, times(1)).saveAll(any());
    }

    @Test
    void testDecrementStock_InsufficientStock() {
        when(productRepository.findById("p100")).thenReturn(Optional.of(sampleProduct));

        StockDecrementRequest req = new StockDecrementRequest("p100", 100);
        ResponseEntity<?> response = productController.decrementStock(List.of(req));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(productRepository, never()).saveAll(any());
    }

    @Test
    void testAddReview_Success() {
        when(productRepository.findById("p100")).thenReturn(Optional.of(sampleProduct));

        Review review = new Review();
        review.setRating(5);
        review.setComment("Excellent value for money!");
        review.setUsername("Aarav");

        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        ResponseEntity<?> response = productController.addProductReview("p100", review);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }
}

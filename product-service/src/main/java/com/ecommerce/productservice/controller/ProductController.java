package com.ecommerce.productservice.controller;

import com.ecommerce.productservice.dto.StockDecrementRequest;
import com.ecommerce.productservice.model.Product;
import com.ecommerce.productservice.model.Review;
import com.ecommerce.productservice.repository.ProductRepository;
import com.ecommerce.productservice.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ProductController(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    @Cacheable(value = "products", key = "{#category, #keyword}")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {

        List<Product> products;

        if (category != null && !category.trim().isEmpty()) {
            if (keyword != null && !keyword.trim().isEmpty()) {
                products = productRepository.searchProductsByCategory(category, keyword);
            } else {
                products = productRepository.findByCategory(category);
            }
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            products = productRepository.searchProducts(keyword);
        } else {
            products = productRepository.findAll();
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Cacheable(value = "productById", key = "#id")
    public ResponseEntity<?> getProductById(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Product not found with id: " + id));
    }

    @PostMapping
    @CacheEvict(value = {"products", "productById"}, allEntries = true)
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    @CacheEvict(value = {"products", "productById"}, allEntries = true)
    public ResponseEntity<?> updateProduct(@PathVariable String id, @Valid @RequestBody Product productDetails) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setImageUrl(productDetails.getImageUrl());
            product.setCategory(productDetails.getCategory());
            product.setStock(productDetails.getStock());
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Product not found with id: " + id));
    }

    @DeleteMapping("/{id}")
    @CacheEvict(value = {"products", "productById"}, allEntries = true)
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            productRepository.delete(productOpt.get());
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully!"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Product not found with id: " + id));
    }

    @PostMapping("/decrement-stock")
    @CacheEvict(value = {"products", "productById"}, allEntries = true)
    public ResponseEntity<?> decrementStock(@RequestBody List<StockDecrementRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Empty stock decrement request"));
        }

        // Validate stock for all items first
        List<Product> productsToUpdate = new ArrayList<>();
        for (StockDecrementRequest item : requests) {
            Optional<Product> opt = productRepository.findById(item.getProductId());
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Product not found with id: " + item.getProductId()));
            }
            Product p = opt.get();
            int currentStock = p.getStock() != null ? p.getStock() : 0;
            int reqQty = item.getQuantity() != null ? item.getQuantity() : 1;
            if (currentStock < reqQty) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Insufficient stock for product '" + p.getName() + "'. Available: " + currentStock));
            }
            p.setStock(currentStock - reqQty);
            productsToUpdate.add(p);
        }

        // Persist all decremented stocks
        productRepository.saveAll(productsToUpdate);
        return ResponseEntity.ok(Map.of("message", "Stock updated successfully", "updatedCount", productsToUpdate.size()));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable String id) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addProductReview(@PathVariable String id, @RequestBody Review review) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Product not found with id: " + id));
        }

        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5."));
        }

        review.setProductId(id);
        if (review.getUsername() == null || review.getUsername().trim().isEmpty()) {
            review.setUsername("Verified Shopper");
        }
        Review saved = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}

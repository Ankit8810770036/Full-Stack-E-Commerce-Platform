package com.ecommerce.productservice.repository;

import com.ecommerce.productservice.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);
}

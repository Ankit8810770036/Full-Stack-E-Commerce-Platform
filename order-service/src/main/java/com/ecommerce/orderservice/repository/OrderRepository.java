package com.ecommerce.orderservice.repository;

import com.ecommerce.orderservice.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<Order> findByOrderId(String orderId);
    List<Order> findAllByOrderByCreatedAtDesc();
}

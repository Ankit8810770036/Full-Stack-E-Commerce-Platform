package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.model.OrderItem;
import com.ecommerce.orderservice.model.ReturnRequest;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${services.product-service.url:http://localhost:8082}")
    private String productServiceUrl;

    public OrderController(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Order items cannot be empty."));
        }

        // Call product-service to decrement stock
        try {
            List<Map<String, Object>> stockDecrementPayload = new ArrayList<>();
            for (OrderItem item : request.getItems()) {
                if (item.getProductId() != null) {
                    stockDecrementPayload.add(Map.of(
                            "productId", item.getProductId(),
                            "quantity", item.getQuantity() != null ? item.getQuantity() : 1
                    ));
                }
            }

            if (!stockDecrementPayload.isEmpty()) {
                restTemplate.postForEntity(
                        productServiceUrl + "/api/products/decrement-stock",
                        stockDecrementPayload,
                        Map.class
                );
            }
        } catch (Exception e) {
            // Log and return error if stock deduction failed due to insufficient stock
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Stock decrement failed: " + e.getMessage()));
        }

        // Create Order Entity
        Order order = new Order();
        String uniqueOrderId = "ODR-" + System.currentTimeMillis() + "-" + (100 + new Random().nextInt(900));
        order.setOrderId(uniqueOrderId);
        order.setUsername(request.getUsername() != null ? request.getUsername() : "guest");
        order.setItems(request.getItems());
        order.setTotalAmount(request.getTotalAmount());
        order.setDiscountAmount(request.getDiscountAmount());
        order.setFinalAmount(request.getFinalAmount());
        order.setPromoCode(request.getPromoCode());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI");
        order.setPaymentStatus("PAID");
        order.setOrderStatus("PLACED");
        order.setShippingAddress(request.getShippingAddress());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(required = false) String username,
            @RequestHeader(value = "X-User-Username", required = false) String headerUser) {

        String user = username != null ? username : headerUser;
        if (user != null && !user.trim().isEmpty()) {
            return ResponseEntity.ok(orderRepository.findByUsernameOrderByCreatedAtDesc(user));
        }

        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            return ResponseEntity.ok(orderOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Order not found with id: " + orderId));
    }

    @PostMapping("/{orderId}/return")
    public ResponseEntity<?> processReturn(@PathVariable String orderId, @RequestBody ReturnRequest returnReq) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Order not found with id: " + orderId));
        }

        Order order = orderOpt.get();
        returnReq.setRequestedAt(Instant.now());
        if (returnReq.getStatus() == null) {
            returnReq.setStatus("PENDING_PICKUP");
        }

        List<ReturnRequest> returns = order.getReturns();
        if (returns == null) {
            returns = new ArrayList<>();
        }
        returns.add(returnReq);
        order.setReturns(returns);

        // Update item return status
        if (order.getItems() != null && returnReq.getItemId() != null) {
            for (OrderItem it : order.getItems()) {
                if (returnReq.getItemId().contains(it.getProductId()) || it.getProductId().equals(returnReq.getItemId())) {
                    it.setReturnStatus("REQUESTED");
                }
            }
        }

        order.setUpdatedAt(Instant.now());
        Order updated = orderRepository.save(order);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Order not found with id: " + orderId));
        }

        Order order = orderOpt.get();
        if ("DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot cancel an already delivered order. Request a return instead."));
        }

        order.setOrderStatus("CANCELLED");
        order.setPaymentStatus("REFUNDED");
        order.setUpdatedAt(Instant.now());
        Order updated = orderRepository.save(order);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrdersForAdmin() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }
}

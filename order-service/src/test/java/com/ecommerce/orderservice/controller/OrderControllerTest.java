package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.model.Address;
import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.model.OrderItem;
import com.ecommerce.orderservice.model.ReturnRequest;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OrderController orderController;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleOrder = new Order();
        sampleOrder.setOrderId("ODR-TEST-12345");
        sampleOrder.setUsername("testuser");
        sampleOrder.setTotalAmount(new BigDecimal("1999.00"));
        sampleOrder.setDiscountAmount(BigDecimal.ZERO);
        sampleOrder.setFinalAmount(new BigDecimal("1999.00"));
        sampleOrder.setPaymentMethod("UPI");
        sampleOrder.setOrderStatus("PLACED");

        OrderItem item = new OrderItem("p1", "Running Shoes", new BigDecimal("1999.00"), 1, "https://example.com/shoes.jpg");
        sampleOrder.setItems(List.of(item));

        Address addr = new Address("Aarav", "9876543210", "560038", "Flat 101", "Indiranagar", "Near Metro", "Bengaluru", "Karnataka", "HOME");
        sampleOrder.setShippingAddress(addr);
    }

    @Test
    void testCreateOrder_Success() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUsername("testuser");
        request.setTotalAmount(new BigDecimal("1999.00"));
        request.setDiscountAmount(BigDecimal.ZERO);
        request.setFinalAmount(new BigDecimal("1999.00"));
        request.setPaymentMethod("UPI");

        OrderItem item = new OrderItem("p1", "Running Shoes", new BigDecimal("1999.00"), 1, "https://example.com/shoes.jpg");
        request.setItems(List.of(item));

        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        ResponseEntity<?> response = orderController.createOrder(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void testCreateOrder_EmptyItems() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUsername("testuser");
        request.setItems(Collections.emptyList());

        ResponseEntity<?> response = orderController.createOrder(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void testGetOrders_ByUser() {
        when(orderRepository.findByUsernameOrderByCreatedAtDesc("testuser")).thenReturn(List.of(sampleOrder));

        ResponseEntity<List<Order>> response = orderController.getOrders("testuser", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("ODR-TEST-12345", response.getBody().get(0).getOrderId());
    }

    @Test
    void testProcessReturn_Success() {
        when(orderRepository.findByOrderId("ODR-TEST-12345")).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        ReturnRequest returnReq = new ReturnRequest();
        returnReq.setItemId("p1");
        returnReq.setReason("Wrong size");
        returnReq.setResolutionType("RETURN");

        ResponseEntity<?> response = orderController.processReturn("ODR-TEST-12345", returnReq);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    void testCancelOrder_Success() {
        when(orderRepository.findByOrderId("ODR-TEST-12345")).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        ResponseEntity<?> response = orderController.cancelOrder("ODR-TEST-12345");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CANCELLED", sampleOrder.getOrderStatus());
        verify(orderRepository, times(1)).save(any(Order.class));
    }
}

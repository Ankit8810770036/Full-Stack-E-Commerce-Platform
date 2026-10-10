package com.ecommerce.userservice.controller;

import com.ecommerce.userservice.dto.AddressRequest;
import com.ecommerce.userservice.dto.UpdateProfileRequest;
import com.ecommerce.userservice.dto.UserProfileResponse;
import com.ecommerce.userservice.model.Address;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found."));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .fullName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .phone(user.getPhone() != null ? user.getPhone() : "+91 98765 43210")
                .gender(user.getGender() != null ? user.getGender() : "Male")
                .dob(user.getDob() != null ? user.getDob() : "1998-05-15")
                .alternatePhone(user.getAlternatePhone())
                .upiIds(user.getUpiIds() != null && !user.getUpiIds().isEmpty() ? user.getUpiIds() : List.of(user.getUsername() + "@okhdfcbank"))
                .preferredPayment(user.getPreferredPayment() != null ? user.getPreferredPayment() : "UPI")
                .addresses(user.getAddresses() != null ? user.getAddresses() : new ArrayList<>())
                .build();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getAlternatePhone() != null) user.setAlternatePhone(request.getAlternatePhone());
        if (request.getUpiIds() != null) user.setUpiIds(request.getUpiIds());
        if (request.getPreferredPayment() != null) user.setPreferredPayment(request.getPreferredPayment());

        userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody AddressRequest request) {
        User user = getAuthenticatedUser();
        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            addresses = new ArrayList<>();
        }

        String id = UUID.randomUUID().toString();
        boolean isFirst = addresses.isEmpty();
        boolean setAsDefault = request.isDefault() || isFirst;

        if (setAsDefault) {
            for (Address a : addresses) {
                a.setDefault(false);
            }
        }

        Address newAddress = new Address(
                id,
                request.getName(),
                request.getPhone(),
                request.getPincode(),
                request.getHouse(),
                request.getArea(),
                request.getLandmark(),
                request.getCity(),
                request.getState(),
                request.getType() != null ? request.getType() : "HOME",
                setAsDefault
        );

        addresses.add(newAddress);
        user.setAddresses(addresses);
        userRepository.save(user);

        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable String id, @RequestBody AddressRequest request) {
        User user = getAuthenticatedUser();
        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Address not found"));
        }

        Address target = null;
        for (Address a : addresses) {
            if (a.getId().equals(id)) {
                target = a;
                break;
            }
        }

        if (target == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Address not found with id: " + id));
        }

        if (request.isDefault()) {
            for (Address a : addresses) {
                a.setDefault(false);
            }
            target.setDefault(true);
        }

        if (request.getName() != null) target.setName(request.getName());
        if (request.getPhone() != null) target.setPhone(request.getPhone());
        if (request.getPincode() != null) target.setPincode(request.getPincode());
        if (request.getHouse() != null) target.setHouse(request.getHouse());
        if (request.getArea() != null) target.setArea(request.getArea());
        if (request.getLandmark() != null) target.setLandmark(request.getLandmark());
        if (request.getCity() != null) target.setCity(request.getCity());
        if (request.getState() != null) target.setState(request.getState());
        if (request.getType() != null) target.setType(request.getType());

        userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable String id) {
        User user = getAuthenticatedUser();
        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            return ResponseEntity.ok(mapToProfileResponse(user));
        }

        boolean removed = addresses.removeIf(a -> a.getId().equals(id));
        if (removed && !addresses.isEmpty()) {
            boolean hasDefault = addresses.stream().anyMatch(Address::isDefault);
            if (!hasDefault) {
                addresses.get(0).setDefault(true);
            }
        }

        user.setAddresses(addresses);
        userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(user));
    }
}

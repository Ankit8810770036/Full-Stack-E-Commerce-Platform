package com.ecommerce.userservice.dto;

import com.ecommerce.userservice.model.Address;

import java.util.List;
import java.util.Set;

public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private Set<String> roles;
    private String fullName;
    private String phone;
    private String gender;
    private String dob;
    private String alternatePhone;
    private List<String> upiIds;
    private String preferredPayment;
    private List<Address> addresses;

    public UserProfileResponse() {
    }

    public static UserProfileResponseBuilder builder() {
        return new UserProfileResponseBuilder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getAlternatePhone() {
        return alternatePhone;
    }

    public void setAlternatePhone(String alternatePhone) {
        this.alternatePhone = alternatePhone;
    }

    public List<String> getUpiIds() {
        return upiIds;
    }

    public void setUpiIds(List<String> upiIds) {
        this.upiIds = upiIds;
    }

    public String getPreferredPayment() {
        return preferredPayment;
    }

    public void setPreferredPayment(String preferredPayment) {
        this.preferredPayment = preferredPayment;
    }

    public List<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

    public static class UserProfileResponseBuilder {
        private String id;
        private String username;
        private String email;
        private Set<String> roles;
        private String fullName;
        private String phone;
        private String gender;
        private String dob;
        private String alternatePhone;
        private List<String> upiIds;
        private String preferredPayment;
        private List<Address> addresses;

        UserProfileResponseBuilder() {
        }

        public UserProfileResponseBuilder id(String id) {
            this.id = id;
            return this;
        }

        public UserProfileResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserProfileResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserProfileResponseBuilder roles(Set<String> roles) {
            this.roles = roles;
            return this;
        }

        public UserProfileResponseBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public UserProfileResponseBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserProfileResponseBuilder gender(String gender) {
            this.gender = gender;
            return this;
        }

        public UserProfileResponseBuilder dob(String dob) {
            this.dob = dob;
            return this;
        }

        public UserProfileResponseBuilder alternatePhone(String alternatePhone) {
            this.alternatePhone = alternatePhone;
            return this;
        }

        public UserProfileResponseBuilder upiIds(List<String> upiIds) {
            this.upiIds = upiIds;
            return this;
        }

        public UserProfileResponseBuilder preferredPayment(String preferredPayment) {
            this.preferredPayment = preferredPayment;
            return this;
        }

        public UserProfileResponseBuilder addresses(List<Address> addresses) {
            this.addresses = addresses;
            return this;
        }

        public UserProfileResponse build() {
            UserProfileResponse response = new UserProfileResponse();
            response.setId(id);
            response.setUsername(username);
            response.setEmail(email);
            response.setRoles(roles);
            response.setFullName(fullName);
            response.setPhone(phone);
            response.setGender(gender);
            response.setDob(dob);
            response.setAlternatePhone(alternatePhone);
            response.setUpiIds(upiIds);
            response.setPreferredPayment(preferredPayment);
            response.setAddresses(addresses);
            return response;
        }
    }
}

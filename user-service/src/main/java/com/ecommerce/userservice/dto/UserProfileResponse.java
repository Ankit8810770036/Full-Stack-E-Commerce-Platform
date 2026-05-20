package com.ecommerce.userservice.dto;

import java.util.Set;

public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private Set<String> roles;

    public UserProfileResponse() {
    }

    public UserProfileResponse(String id, String username, String email, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
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

    public static class UserProfileResponseBuilder {
        private String id;
        private String username;
        private String email;
        private Set<String> roles;

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

        public UserProfileResponse build() {
            return new UserProfileResponse(id, username, email, roles);
        }
    }
}

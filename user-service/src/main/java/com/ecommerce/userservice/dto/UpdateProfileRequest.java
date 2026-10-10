package com.ecommerce.userservice.dto;

import java.util.List;

public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String gender;
    private String dob;
    private String alternatePhone;
    private List<String> upiIds;
    private String preferredPayment;

    public UpdateProfileRequest() {
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
}

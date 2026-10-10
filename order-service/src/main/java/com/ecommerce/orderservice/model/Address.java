package com.ecommerce.orderservice.model;

public class Address {
    private String name;
    private String phone;
    private String pincode;
    private String house;
    private String area;
    private String landmark;
    private String city;
    private String state;
    private String type;

    public Address() {
    }

    public Address(String name, String phone, String pincode, String house, String area, String landmark, String city, String state, String type) {
        this.name = name;
        this.phone = phone;
        this.pincode = pincode;
        this.house = house;
        this.area = area;
        this.landmark = landmark;
        this.city = city;
        this.state = state;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getHouse() {
        return house;
    }

    public void setHouse(String house) {
        this.house = house;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String state() {
        return state;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

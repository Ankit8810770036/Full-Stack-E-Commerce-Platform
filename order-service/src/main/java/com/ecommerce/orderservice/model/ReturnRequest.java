package com.ecommerce.orderservice.model;

import java.math.BigDecimal;
import java.time.Instant;

public class ReturnRequest {
    private String itemId;
    private String reason;
    private String comments;
    private String resolutionType; // REFUND_ORIGINAL, STORE_WALLET, REPLACEMENT
    private String status; // PENDING_PICKUP, IN_TRANSIT, COMPLETED, CANCELLED
    private BigDecimal refundAmount;
    private String upiRefundId;
    private Instant requestedAt = Instant.now();

    public ReturnRequest() {
    }

    public ReturnRequest(String itemId, String reason, String comments, String resolutionType, String status, BigDecimal refundAmount, String upiRefundId) {
        this.itemId = itemId;
        this.reason = reason;
        this.comments = comments;
        this.resolutionType = resolutionType;
        this.status = status;
        this.refundAmount = refundAmount;
        this.upiRefundId = upiRefundId;
        this.requestedAt = Instant.now();
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getResolutionType() {
        return resolutionType;
    }

    public void setResolutionType(String resolutionType) {
        this.resolutionType = resolutionType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getUpiRefundId() {
        return upiRefundId;
    }

    public void setUpiRefundId(String upiRefundId) {
        this.upiRefundId = upiRefundId;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }
}

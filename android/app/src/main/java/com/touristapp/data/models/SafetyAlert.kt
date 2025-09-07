package com.touristapp.data.models

data class SafetyAlert(
    val id: String,
    val title: String,
    val message: String,
    val severity: String, // low, medium, high
    val zoneId: String,
    val createdAt: String,
    val updatedAt: String
)

data class SafetyAlertsResponse(
    val success: Boolean,
    val alerts: List<SafetyAlert>
)
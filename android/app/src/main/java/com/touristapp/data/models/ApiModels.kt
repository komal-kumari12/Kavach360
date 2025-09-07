package com.touristapp.data.models

import com.google.gson.annotations.SerializedName

// Authentication Models
data class LoginRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("nationality") val nationality: String? = null,
    @SerializedName("passportNumber") val passportNumber: String? = null,
    @SerializedName("emergencyContact") val emergencyContact: String? = null
)

data class AuthResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("token") val token: String,
    @SerializedName("user") val user: User
)

data class User(
    @SerializedName("id") val id: Int,
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String
)

// Profile Models
data class UserProfileResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: UserProfileData
)

data class UserProfileData(
    @SerializedName("user") val user: User,
    @SerializedName("profile") val profile: TouristProfile,
    @SerializedName("digital_id") val digitalId: DigitalIdInfo?
)

data class TouristProfile(
    @SerializedName("full_name") val fullName: String,
    @SerializedName("nationality") val nationality: String?,
    @SerializedName("passport_number") val passportNumber: String?,
    @SerializedName("emergency_contact") val emergencyContact: String?
)

data class DigitalIdInfo(
    @SerializedName("blockchain_id") val blockchainId: String,
    @SerializedName("verification_status") val verificationStatus: Boolean
)

data class ProfileUpdateRequest(
    @SerializedName("fullName") val fullName: String? = null,
    @SerializedName("nationality") val nationality: String? = null,
    @SerializedName("passportNumber") val passportNumber: String? = null,
    @SerializedName("emergencyContact") val emergencyContact: String? = null,
    @SerializedName("email") val email: String? = null
)

// Digital ID Models
data class DigitalIdResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: DigitalIdData
)

data class DigitalIdData(
    @SerializedName("id_hash") val idHash: String,
    @SerializedName("blockchain_address") val blockchainAddress: String?,
    @SerializedName("blockchain_registered") val blockchainRegistered: Boolean,
    @SerializedName("issue_date") val issueDate: String,
    @SerializedName("expiry_date") val expiryDate: String,
    @SerializedName("status") val status: String
)

data class DigitalIdDetailsResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: DigitalIdDetailsData
)

data class DigitalIdDetailsData(
    @SerializedName("digital_id") val digitalId: DigitalIdDetails
)

data class DigitalIdDetails(
    @SerializedName("id") val id: Int,
    @SerializedName("blockchain_address") val blockchainAddress: String?,
    @SerializedName("id_hash") val idHash: String,
    @SerializedName("kyc_verified") val kycVerified: Boolean,
    @SerializedName("blockchain_verified") val blockchainVerified: Boolean,
    @SerializedName("issue_date") val issueDate: String,
    @SerializedName("expiry_date") val expiryDate: String,
    @SerializedName("status") val status: String
)

data class VerifyDigitalIdRequest(
    @SerializedName("idHash") val idHash: String
)

data class VerifyDigitalIdResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: VerifyDigitalIdData
)

data class VerifyDigitalIdData(
    @SerializedName("verified") val verified: Boolean,
    @SerializedName("blockchain_verified") val blockchainVerified: Boolean,
    @SerializedName("user_info") val userInfo: VerifiedUserInfo
)

data class VerifiedUserInfo(
    @SerializedName("username") val username: String,
    @SerializedName("full_name") val fullName: String,
    @SerializedName("nationality") val nationality: String?,
    @SerializedName("issue_date") val issueDate: String,
    @SerializedName("expiry_date") val expiryDate: String,
    @SerializedName("status") val status: String
)

data class QrCodeDataResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: QrCodeData
)

data class QrCodeData(
    @SerializedName("qr_data") val qrData: String
)

// Geofencing Models
data class GeofenceZonesResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: GeofenceZonesData
)

data class GeofenceZonesData(
    @SerializedName("zones") val zones: List<GeofenceZone>
)

data class GeofenceZone(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String?,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("radius") val radius: Double,
    @SerializedName("alert_type") val alertType: String,
    @SerializedName("created_at") val createdAt: String
)

data class CurrentZoneResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CurrentZoneData
)

data class CurrentZoneData(
    @SerializedName("zone") val zone: GeofenceZone?,
    @SerializedName("distance") val distance: Double?,
    @SerializedName("is_inside") val isInside: Boolean
)

data class LocationRequest(
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("batteryLevel") val batteryLevel: Float? = null,
    @SerializedName("connectionStatus") val connectionStatus: String? = null
)

data class LocationResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String
)

data class LocationHistoryResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: LocationHistoryData
)

data class LocationHistoryData(
    @SerializedName("locations") val locations: List<LocationLog>,
    @SerializedName("total") val total: Int,
    @SerializedName("limit") val limit: Int,
    @SerializedName("offset") val offset: Int
)

data class LocationLog(
    @SerializedName("id") val id: Int,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("battery_level") val batteryLevel: Float?,
    @SerializedName("connection_status") val connectionStatus: String?
)

// Alert Models
data class AlertRequest(
    @SerializedName("alertType") val alertType: String,
    @SerializedName("latitude") val latitude: Double? = null,
    @SerializedName("longitude") val longitude: Double? = null,
    @SerializedName("description") val description: String? = null
)

data class AlertResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: AlertData
)

data class AlertData(
    @SerializedName("id") val id: Int,
    @SerializedName("alert_type") val alertType: String,
    @SerializedName("status") val status: String,
    @SerializedName("created_at") val createdAt: String
)

data class SafetyAlertsResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: SafetyAlertsData
)

data class SafetyAlertsData(
    @SerializedName("alerts") val alerts: List<SafetyAlert>
)

data class SafetyAlert(
    @SerializedName("id") val id: Int,
    @SerializedName("alert_type") val alertType: String,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("description") val description: String?,
    @SerializedName("status") val status: String,
    @SerializedName("read") val read: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("resolved_at") val resolvedAt: String?
)

data class AlertsResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: AlertsData
)

data class AlertsData(
    @SerializedName("alerts") val alerts: List<SafetyAlert>
)

// Common Response Models
data class MessageResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String
)

// Error Response Model
data class ErrorResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("details") val details: List<String>? = null,
    @SerializedName("error") val error: String? = null
)

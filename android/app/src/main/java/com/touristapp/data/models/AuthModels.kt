package com.touristapp.data.models

import com.google.gson.annotations.SerializedName

// Login Request
data class LoginRequest(
    @SerializedName("username")
    val username: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("deviceToken")
    val deviceToken: String? = null,
    @SerializedName("appVersion")
    val appVersion: String? = null,
    @SerializedName("platform")
    val platform: String? = "android"
)

// Register Request
data class RegisterRequest(
    @SerializedName("username")
    val username: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("fullName")
    val fullName: String,
    @SerializedName("nationality")
    val nationality: String? = null,
    @SerializedName("passportNumber")
    val passportNumber: String? = null,
    @SerializedName("emergencyContact")
    val emergencyContact: String? = null,
    @SerializedName("emergencyPhone")
    val emergencyPhone: String? = null,
    @SerializedName("bloodGroup")
    val bloodGroup: String? = null,
    @SerializedName("medicalConditions")
    val medicalConditions: String? = null,
    @SerializedName("allergies")
    val allergies: String? = null,
    @SerializedName("tripStartDate")
    val tripStartDate: String? = null,
    @SerializedName("tripEndDate")
    val tripEndDate: String? = null,
    @SerializedName("deviceToken")
    val deviceToken: String? = null,
    @SerializedName("appVersion")
    val appVersion: String? = null,
    @SerializedName("platform")
    val platform: String? = "android"
)

// User Model
data class User(
    @SerializedName("id")
    val id: Int,
    @SerializedName("username")
    val username: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("role")
    val role: String,
    @SerializedName("fullName")
    val fullName: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

// Auth Response
data class AuthResponse(
    @SerializedName("status")
    val status: String,
    @SerializedName("message")
    val message: String,
    @SerializedName("data")
    val data: AuthData? = null
)

data class AuthData(
    @SerializedName("user")
    val user: User,
    @SerializedName("token")
    val token: String,
    @SerializedName("refreshToken")
    val refreshToken: String
)

// User Profile Response
data class UserProfileResponse(
    @SerializedName("status")
    val status: String,
    @SerializedName("message")
    val message: String? = null,
    @SerializedName("data")
    val data: ProfileData? = null
)

data class ProfileData(
    @SerializedName("user")
    val user: User,
    @SerializedName("profile")
    val profile: TouristProfile
)

data class TouristProfile(
    @SerializedName("fullName")
    val fullName: String? = null,
    @SerializedName("nationality")
    val nationality: String? = null,
    @SerializedName("passportNumber")
    val passportNumber: String? = null,
    @SerializedName("emergencyContact")
    val emergencyContact: String? = null,
    @SerializedName("emergencyPhone")
    val emergencyPhone: String? = null,
    @SerializedName("bloodGroup")
    val bloodGroup: String? = null,
    @SerializedName("medicalConditions")
    val medicalConditions: String? = null,
    @SerializedName("allergies")
    val allergies: String? = null,
    @SerializedName("tripStartDate")
    val tripStartDate: String? = null,
    @SerializedName("tripEndDate")
    val tripEndDate: String? = null,
    @SerializedName("currentLocation")
    val currentLocation: Location? = null,
    @SerializedName("deviceToken")
    val deviceToken: String? = null,
    @SerializedName("appVersion")
    val appVersion: String? = null,
    @SerializedName("platform")
    val platform: String? = null
)

data class Location(
    @SerializedName("latitude")
    val latitude: Double? = null,
    @SerializedName("longitude")
    val longitude: Double? = null
)

// Profile Update Request
data class ProfileUpdateRequest(
    @SerializedName("fullName")
    val fullName: String? = null,
    @SerializedName("nationality")
    val nationality: String? = null,
    @SerializedName("passportNumber")
    val passportNumber: String? = null,
    @SerializedName("emergencyContact")
    val emergencyContact: String? = null,
    @SerializedName("emergencyPhone")
    val emergencyPhone: String? = null,
    @SerializedName("bloodGroup")
    val bloodGroup: String? = null,
    @SerializedName("medicalConditions")
    val medicalConditions: String? = null,
    @SerializedName("allergies")
    val allergies: String? = null,
    @SerializedName("tripStartDate")
    val tripStartDate: String? = null,
    @SerializedName("tripEndDate")
    val tripEndDate: String? = null
)

// Message Response
data class MessageResponse(
    @SerializedName("status")
    val status: String,
    @SerializedName("message")
    val message: String
)

package com.touristapp.data.api

import com.touristapp.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication endpoints
    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @GET("auth/profile")
    suspend fun getUserProfile(@Header("Authorization") token: String): Response<UserProfileResponse>
    
    @PUT("auth/profile")
    suspend fun updateUserProfile(
        @Header("Authorization") token: String,
        @Body profileUpdateRequest: ProfileUpdateRequest
    ): Response<MessageResponse>
    
    // Digital ID endpoints
    @POST("auth/digital-id")
    suspend fun registerDigitalId(
        @Header("Authorization") token: String
    ): Response<DigitalIdResponse>
    
    @GET("digital-id/details")
    suspend fun getDigitalIdDetails(
        @Header("Authorization") token: String
    ): Response<DigitalIdDetailsResponse>
    
    @POST("digital-id/verify")
    suspend fun verifyDigitalId(
        @Body verifyRequest: VerifyDigitalIdRequest
    ): Response<VerifyDigitalIdResponse>
    
    @GET("digital-id/qr-code")
    suspend fun getQrCodeData(
        @Header("Authorization") token: String
    ): Response<QrCodeDataResponse>
    
    // Geofencing endpoints
    @GET("geofencing/zones")
    suspend fun getAllZones(
        @Header("Authorization") token: String
    ): Response<GeofenceZonesResponse>
    
    @GET("geofencing/current-zone")
    suspend fun getCurrentZone(
        @Header("Authorization") token: String,
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double
    ): Response<CurrentZoneResponse>
    
    // Safety alerts endpoints
    @GET("alerts")
    suspend fun getSafetyAlerts(
        @Header("Authorization") token: String
    ): Response<SafetyAlertsResponse>
    
    @POST("geofencing/location")
    suspend fun logLocation(
        @Header("Authorization") token: String,
        @Body locationRequest: LocationRequest
    ): Response<LocationResponse>
    
    @GET("geofencing/location/history")
    suspend fun getLocationHistory(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0
    ): Response<LocationHistoryResponse>
    
    @POST("geofencing/alert")
    suspend fun createAlert(
        @Header("Authorization") token: String,
        @Body alertRequest: AlertRequest
    ): Response<AlertResponse>
    
    @GET("geofencing/alerts")
    suspend fun getUserAlerts(
        @Header("Authorization") token: String
    ): Response<AlertsResponse>
}
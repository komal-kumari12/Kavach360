package com.touristapp.data.models

data class CurrentZoneResponse(
    val success: Boolean,
    val currentZone: GeofenceZone?,
    val message: String
)
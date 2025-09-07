package com.touristapp.ui.alerts

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.SafetyAlert
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AlertsViewModel : ViewModel() {

    private val _alerts = MutableLiveData<List<SafetyAlert>>(emptyList())
    val alerts: LiveData<List<SafetyAlert>> = _alerts

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://localhost:3000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun loadAlerts() {
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.getSafetyAlerts("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _alerts.value = response.body()?.alerts ?: emptyList()
                }
            } catch (e: Exception) {
                // For demo purposes, create mock alerts
                val mockAlerts = listOf(
                    SafetyAlert(
                        id = "1",
                        title = "Avoid Downtown Area",
                        message = "Due to ongoing protests, tourists are advised to avoid the downtown area until further notice.",
                        severity = "high",
                        zoneId = "3",
                        createdAt = "2023-06-15T14:30:00Z",
                        updatedAt = "2023-06-15T14:30:00Z"
                    ),
                    SafetyAlert(
                        id = "2",
                        title = "Beach Safety Warning",
                        message = "Strong currents reported at the main beach. Swim only in designated areas with lifeguards present.",
                        severity = "medium",
                        zoneId = "2",
                        createdAt = "2023-06-14T10:15:00Z",
                        updatedAt = "2023-06-14T10:15:00Z"
                    ),
                    SafetyAlert(
                        id = "3",
                        title = "Tourist Information Center Relocated",
                        message = "The main tourist information center has been temporarily relocated to the City Hall building.",
                        severity = "low",
                        zoneId = "1",
                        createdAt = "2023-06-13T09:00:00Z",
                        updatedAt = "2023-06-13T09:00:00Z"
                    )
                )
                _alerts.value = mockAlerts
            }
        }
    }
}
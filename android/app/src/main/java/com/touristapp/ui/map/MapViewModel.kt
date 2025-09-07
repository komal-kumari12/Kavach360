package com.touristapp.ui.map

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.SafetyZone
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MapViewModel : ViewModel() {

    private val _mapStatus = MutableLiveData<MapStatus>(MapStatus.LOADING)
    val mapStatus: LiveData<MapStatus> = _mapStatus

    private val _safetyZones = MutableLiveData<List<SafetyZone>>(emptyList())
    private val _currentZone = MutableLiveData<SafetyZone?>()
    val currentZone: LiveData<SafetyZone?> = _currentZone

    private val _operationResult = MutableLiveData<OperationResult>(OperationResult.Idle)
    val operationResult: LiveData<OperationResult> = _operationResult

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://localhost:3000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun loadSafetyZones() {
        _mapStatus.value = MapStatus.LOADING
        
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.getSafetyZones("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _safetyZones.value = response.body()?.zones ?: emptyList()
                    _mapStatus.value = MapStatus.LOADED
                } else {
                    _mapStatus.value = MapStatus.ERROR
                    _operationResult.value = OperationResult.Error("Failed to load safety zones: ${response.message()}")
                }
            } catch (e: Exception) {
                _mapStatus.value = MapStatus.ERROR
                _operationResult.value = OperationResult.Error("Failed to load safety zones: ${e.message}")
                
                // For demo purposes, create mock safety zones
                val mockZones = listOf(
                    SafetyZone(
                        id = "1",
                        name = "City Center",
                        safetyLevel = "safe",
                        description = "Tourist-friendly area with police presence",
                        coordinates = listOf(listOf(0.0, 0.0), listOf(0.0, 1.0), listOf(1.0, 1.0), listOf(1.0, 0.0)),
                        createdAt = "2023-01-01T00:00:00Z",
                        updatedAt = "2023-01-01T00:00:00Z"
                    ),
                    SafetyZone(
                        id = "2",
                        name = "Beach Area",
                        safetyLevel = "warning",
                        description = "Exercise caution at night",
                        coordinates = listOf(listOf(1.0, 0.0), listOf(1.0, 1.0), listOf(2.0, 1.0), listOf(2.0, 0.0)),
                        createdAt = "2023-01-01T00:00:00Z",
                        updatedAt = "2023-01-01T00:00:00Z"
                    ),
                    SafetyZone(
                        id = "3",
                        name = "Industrial District",
                        safetyLevel = "danger",
                        description = "Avoid this area, especially at night",
                        coordinates = listOf(listOf(2.0, 0.0), listOf(2.0, 1.0), listOf(3.0, 1.0), listOf(3.0, 0.0)),
                        createdAt = "2023-01-01T00:00:00Z",
                        updatedAt = "2023-01-01T00:00:00Z"
                    )
                )
                _safetyZones.value = mockZones
                _mapStatus.value = MapStatus.LOADED
            }
        }
    }

    fun refreshLocation() {
        _operationResult.value = OperationResult.Loading
        
        viewModelScope.launch {
            try {
                // In a real app, we would get the current location and send it to the API
                // For demo purposes, we'll simulate being in a random zone
                val zones = _safetyZones.value
                if (!zones.isNullOrEmpty()) {
                    val randomZone = zones.random()
                    _currentZone.value = randomZone
                    
                    // Log location to API
                    val token = "dummy_token"
                    val response = apiService.logLocation("Bearer $token", 0.0, 0.0)
                    
                    if (response.isSuccessful) {
                        _operationResult.value = OperationResult.Success("Location updated")
                    } else {
                        _operationResult.value = OperationResult.Error("Failed to log location: ${response.message()}")
                    }
                } else {
                    _operationResult.value = OperationResult.Error("No safety zones available")
                }
            } catch (e: Exception) {
                _operationResult.value = OperationResult.Error("Failed to refresh location: ${e.message}")
                
                // For demo purposes, simulate being in a random zone
                val zones = _safetyZones.value
                if (!zones.isNullOrEmpty()) {
                    _currentZone.value = zones.random()
                    _operationResult.value = OperationResult.Success("Location updated (Demo)")
                }
            }
        }
    }

    enum class MapStatus {
        LOADING,
        LOADED,
        ERROR
    }

    sealed class OperationResult {
        object Idle : OperationResult()
        object Loading : OperationResult()
        data class Success(val message: String) : OperationResult()
        data class Error(val message: String) : OperationResult()
    }
}
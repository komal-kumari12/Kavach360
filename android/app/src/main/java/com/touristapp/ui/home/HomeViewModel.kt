package com.touristapp.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.TouristProfile
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class HomeViewModel : ViewModel() {

    private val _userProfile = MutableLiveData<TouristProfile?>()
    val userProfile: LiveData<TouristProfile?> = _userProfile

    private val _safetyStatus = MutableLiveData<SafetyStatus>(SafetyStatus.UNKNOWN)
    val safetyStatus: LiveData<SafetyStatus> = _safetyStatus

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://localhost:3000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun loadUserProfile() {
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.getUserProfile("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _userProfile.value = response.body()?.profile
                }
            } catch (e: Exception) {
                // Handle error
                // For demo, we'll use a mock profile
                _userProfile.value = TouristProfile(
                    id = "1",
                    name = "John Doe",
                    email = "john.doe@example.com",
                    nationality = "USA",
                    passportNumber = "A1234567",
                    phoneNumber = "+1234567890"
                )
            }
        }
    }

    fun checkSafetyStatus() {
        viewModelScope.launch {
            try {
                // In a real app, we would get the current location and check with the API
                // For demo purposes, we'll simulate different statuses
                val mockStatus = (0..3).random()
                _safetyStatus.value = when (mockStatus) {
                    0 -> SafetyStatus.SAFE
                    1 -> SafetyStatus.WARNING
                    2 -> SafetyStatus.DANGER
                    else -> SafetyStatus.UNKNOWN
                }
            } catch (e: Exception) {
                _safetyStatus.value = SafetyStatus.UNKNOWN
            }
        }
    }

    enum class SafetyStatus {
        SAFE,
        WARNING,
        DANGER,
        UNKNOWN
    }
}
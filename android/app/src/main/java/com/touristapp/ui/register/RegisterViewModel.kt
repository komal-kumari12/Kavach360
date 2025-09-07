package com.touristapp.ui.register

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.touristapp.BuildConfig
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.RegisterRequest
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RegisterViewModel : ViewModel() {

    private val _registerResult = MutableLiveData<RegisterResult>(RegisterResult.Idle)
    val registerResult: LiveData<RegisterResult> = _registerResult

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun register(
        username: String,
        email: String,
        fullName: String,
        nationality: String?,
        passportNumber: String?,
        emergencyContact: String?,
        password: String
    ) {
        _registerResult.value = RegisterResult.Loading
        
        viewModelScope.launch {
            try {
                val registerRequest = RegisterRequest(
                    username = username,
                    email = email,
                    password = password,
                    fullName = fullName,
                    nationality = nationality,
                    passportNumber = passportNumber,
                    emergencyContact = emergencyContact,
                    platform = "android"
                )
                val response = apiService.register(registerRequest)
                
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    if (authResponse.status == "success") {
                        _registerResult.value = RegisterResult.Success
                    } else {
                        _registerResult.value = RegisterResult.Error(authResponse.message ?: "Registration failed")
                    }
                } else {
                    _registerResult.value = RegisterResult.Error("Registration failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _registerResult.value = RegisterResult.Error("Registration failed: ${e.message}")
            }
        }
    }

    sealed class RegisterResult {
        object Idle : RegisterResult()
        object Loading : RegisterResult()
        object Success : RegisterResult()
        data class Error(val message: String) : RegisterResult()
    }
}

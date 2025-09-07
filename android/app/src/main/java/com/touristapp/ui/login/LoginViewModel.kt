package com.touristapp.ui.login

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.touristapp.BuildConfig
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.LoginRequest
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class LoginViewModel : ViewModel() {

    private val _loginResult = MutableLiveData<LoginResult>(LoginResult.Idle)
    val loginResult: LiveData<LoginResult> = _loginResult

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun login(username: String, password: String) {
        _loginResult.value = LoginResult.Loading
        
        viewModelScope.launch {
            try {
                val loginRequest = LoginRequest(
                    username = username,
                    password = password,
                    platform = "android"
                )
                val response = apiService.login(loginRequest)
                
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    if (authResponse.status == "success" && authResponse.data != null) {
                        // Store token and user data
                        // For now, we'll just consider login successful
                        _loginResult.value = LoginResult.Success(authResponse.data.token)
                    } else {
                        _loginResult.value = LoginResult.Error(authResponse.message ?: "Login failed")
                    }
                } else {
                    _loginResult.value = LoginResult.Error("Login failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _loginResult.value = LoginResult.Error("Login failed: ${e.message}")
            }
        }
    }

    sealed class LoginResult {
        object Idle : LoginResult()
        object Loading : LoginResult()
        data class Success(val token: String) : LoginResult()
        data class Error(val message: String) : LoginResult()
    }
}

package com.touristapp.ui.digitalid

import android.graphics.Bitmap
import android.graphics.Color
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.touristapp.data.api.ApiService
import com.touristapp.data.models.DigitalId
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class DigitalIdViewModel : ViewModel() {

    private val _digitalId = MutableLiveData<DigitalId?>()
    val digitalId: LiveData<DigitalId?> = _digitalId

    private val _qrCode = MutableLiveData<Bitmap?>()
    val qrCode: LiveData<Bitmap?> = _qrCode

    private val _operationResult = MutableLiveData<OperationResult>(OperationResult.Idle)
    val operationResult: LiveData<OperationResult> = _operationResult

    private val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://localhost:3000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun loadDigitalId() {
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.getDigitalId("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _digitalId.value = response.body()?.digitalId
                    generateQRCode()
                } else {
                    // For demo purposes, create a mock digital ID
                    _digitalId.value = DigitalId(
                        id = "1",
                        userId = "1",
                        name = "John Doe",
                        nationality = "USA",
                        passportNumber = "A1234567",
                        verificationStatus = "verified",
                        blockchainHash = "0x1234567890abcdef",
                        createdAt = "2023-01-01T00:00:00Z",
                        updatedAt = "2023-01-01T00:00:00Z"
                    )
                    generateQRCode()
                }
            } catch (e: Exception) {
                _operationResult.value = OperationResult.Error("Failed to load digital ID: ${e.message}")
                // For demo purposes, create a mock digital ID
                _digitalId.value = DigitalId(
                    id = "1",
                    userId = "1",
                    name = "John Doe",
                    nationality = "USA",
                    passportNumber = "A1234567",
                    verificationStatus = "verified",
                    blockchainHash = "0x1234567890abcdef",
                    createdAt = "2023-01-01T00:00:00Z",
                    updatedAt = "2023-01-01T00:00:00Z"
                )
                generateQRCode()
            }
        }
    }

    fun registerDigitalId(nationality: String, passportNumber: String, name: String) {
        _operationResult.value = OperationResult.Loading
        
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.registerDigitalId("Bearer $token", nationality, passportNumber, name)
                
                if (response.isSuccessful && response.body() != null) {
                    _digitalId.value = response.body()?.digitalId
                    _operationResult.value = OperationResult.Success("Digital ID registered successfully")
                    generateQRCode()
                } else {
                    _operationResult.value = OperationResult.Error("Failed to register digital ID: ${response.message()}")
                }
            } catch (e: Exception) {
                _operationResult.value = OperationResult.Error("Failed to register digital ID: ${e.message}")
                // For demo purposes, create a mock digital ID
                _digitalId.value = DigitalId(
                    id = "1",
                    userId = "1",
                    name = name,
                    nationality = nationality,
                    passportNumber = passportNumber,
                    verificationStatus = "pending",
                    blockchainHash = "",
                    createdAt = "2023-01-01T00:00:00Z",
                    updatedAt = "2023-01-01T00:00:00Z"
                )
                _operationResult.value = OperationResult.Success("Digital ID registered successfully (Demo)")
                generateQRCode()
            }
        }
    }

    fun verifyDigitalId() {
        _operationResult.value = OperationResult.Loading
        
        viewModelScope.launch {
            try {
                // In a real app, we would get the token from secure storage
                val token = "dummy_token"
                val response = apiService.verifyDigitalId("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    _digitalId.value = response.body()?.digitalId
                    _operationResult.value = OperationResult.Success("Digital ID verified successfully")
                    generateQRCode()
                } else {
                    _operationResult.value = OperationResult.Error("Failed to verify digital ID: ${response.message()}")
                }
            } catch (e: Exception) {
                _operationResult.value = OperationResult.Error("Failed to verify digital ID: ${e.message}")
                // For demo purposes, update the mock digital ID
                _digitalId.value = _digitalId.value?.copy(
                    verificationStatus = "verified",
                    blockchainHash = "0x1234567890abcdef"
                )
                _operationResult.value = OperationResult.Success("Digital ID verified successfully (Demo)")
                generateQRCode()
            }
        }
    }

    private fun generateQRCode() {
        val digitalId = _digitalId.value ?: return
        
        try {
            val qrCodeWriter = QRCodeWriter()
            val bitMatrix = qrCodeWriter.encode(
                "{\
                    \"id\":\"${digitalId.id}\",\
                    \"name\":\"${digitalId.name}\",\
                    \"nationality\":\"${digitalId.nationality}\",\
                    \"passportNumber\":\"${digitalId.passportNumber}\",\
                    \"verificationStatus\":\"${digitalId.verificationStatus}\",\
                    \"blockchainHash\":\"${digitalId.blockchainHash}\"\
                }",
                BarcodeFormat.QR_CODE,
                300,
                300
            )
            
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
            
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
                }
            }
            
            _qrCode.value = bitmap
        } catch (e: Exception) {
            _operationResult.value = OperationResult.Error("Failed to generate QR code: ${e.message}")
        }
    }

    sealed class OperationResult {
        object Idle : OperationResult()
        object Loading : OperationResult()
        data class Success(val message: String) : OperationResult()
        data class Error(val message: String) : OperationResult()
    }
}
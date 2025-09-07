package com.touristapp.ui.digitalid

import android.graphics.Bitmap
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.touristapp.R

class DigitalIdFragment : Fragment() {

    private lateinit var viewModel: DigitalIdViewModel
    private lateinit var nameTextView: TextView
    private lateinit var nationalityTextView: TextView
    private lateinit var passportTextView: TextView
    private lateinit var statusTextView: TextView
    private lateinit var qrCodeImageView: ImageView
    private lateinit var registerButton: Button
    private lateinit var verifyButton: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_digital_id, container, false)
        
        // Initialize views
        nameTextView = view.findViewById(R.id.name_text_view)
        nationalityTextView = view.findViewById(R.id.nationality_text_view)
        passportTextView = view.findViewById(R.id.passport_text_view)
        statusTextView = view.findViewById(R.id.status_text_view)
        qrCodeImageView = view.findViewById(R.id.qr_code_image_view)
        registerButton = view.findViewById(R.id.register_button)
        verifyButton = view.findViewById(R.id.verify_button)
        
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(DigitalIdViewModel::class.java)
        
        // Load digital ID
        viewModel.loadDigitalId()
        
        // Set up click listeners
        registerButton.setOnClickListener {
            // In a real app, we would show a form to collect passport details
            // For demo purposes, we'll use mock data
            viewModel.registerDigitalId(
                "USA",
                "A1234567",
                "John Doe"
            )
        }
        
        verifyButton.setOnClickListener {
            viewModel.verifyDigitalId()
        }
        
        // Observe digital ID
        viewModel.digitalId.observe(viewLifecycleOwner) { digitalId ->
            if (digitalId != null) {
                nameTextView.text = digitalId.name
                nationalityTextView.text = digitalId.nationality
                passportTextView.text = digitalId.passportNumber
                statusTextView.text = when (digitalId.verificationStatus) {
                    "verified" -> "Verified ✓"
                    "pending" -> "Pending Verification"
                    "rejected" -> "Verification Failed"
                    else -> "Not Registered"
                }
                
                // Show/hide buttons based on status
                if (digitalId.verificationStatus == "not_registered") {
                    registerButton.visibility = View.VISIBLE
                    verifyButton.visibility = View.GONE
                } else if (digitalId.verificationStatus == "pending") {
                    registerButton.visibility = View.GONE
                    verifyButton.visibility = View.VISIBLE
                } else {
                    registerButton.visibility = View.GONE
                    verifyButton.visibility = View.GONE
                }
            } else {
                // No digital ID registered
                nameTextView.text = ""
                nationalityTextView.text = ""
                passportTextView.text = ""
                statusTextView.text = "Not Registered"
                registerButton.visibility = View.VISIBLE
                verifyButton.visibility = View.GONE
            }
        }
        
        // Observe QR code
        viewModel.qrCode.observe(viewLifecycleOwner) { bitmap ->
            if (bitmap != null) {
                qrCodeImageView.setImageBitmap(bitmap)
                qrCodeImageView.visibility = View.VISIBLE
            } else {
                qrCodeImageView.visibility = View.GONE
            }
        }
        
        // Observe operation result
        viewModel.operationResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is DigitalIdViewModel.OperationResult.Success -> {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is DigitalIdViewModel.OperationResult.Error -> {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is DigitalIdViewModel.OperationResult.Loading -> {
                    // Show loading indicator
                }
                is DigitalIdViewModel.OperationResult.Idle -> {
                    // Reset UI state
                }
            }
        }
    }
}
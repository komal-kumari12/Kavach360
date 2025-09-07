package com.touristapp.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.touristapp.R

class HomeFragment : Fragment() {

    private lateinit var viewModel: HomeViewModel
    private lateinit var welcomeTextView: TextView
    private lateinit var safetyStatusTextView: TextView
    private lateinit var viewDigitalIdButton: Button
    private lateinit var viewMapButton: Button
    private lateinit var viewAlertsButton: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        
        // Initialize views
        welcomeTextView = view.findViewById(R.id.welcome_text_view)
        safetyStatusTextView = view.findViewById(R.id.safety_status_text_view)
        viewDigitalIdButton = view.findViewById(R.id.view_digital_id_button)
        viewMapButton = view.findViewById(R.id.view_map_button)
        viewAlertsButton = view.findViewById(R.id.view_alerts_button)
        
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(HomeViewModel::class.java)
        
        // Load user profile
        viewModel.loadUserProfile()
        
        // Set up click listeners
        viewDigitalIdButton.setOnClickListener {
            findNavController().navigate(R.id.action_homeFragment_to_digitalIdFragment)
        }
        
        viewMapButton.setOnClickListener {
            findNavController().navigate(R.id.action_homeFragment_to_mapFragment)
        }
        
        viewAlertsButton.setOnClickListener {
            findNavController().navigate(R.id.action_homeFragment_to_alertsFragment)
        }
        
        // Observe user profile
        viewModel.userProfile.observe(viewLifecycleOwner) { profile ->
            if (profile != null) {
                welcomeTextView.text = "Welcome, ${profile.name}"
            }
        }
        
        // Observe safety status
        viewModel.safetyStatus.observe(viewLifecycleOwner) { status ->
            safetyStatusTextView.text = when (status) {
                HomeViewModel.SafetyStatus.SAFE -> "Current Status: Safe Zone"
                HomeViewModel.SafetyStatus.WARNING -> "Current Status: Warning Zone - Be Cautious"
                HomeViewModel.SafetyStatus.DANGER -> "Current Status: DANGER ZONE - Leave Immediately"
                HomeViewModel.SafetyStatus.UNKNOWN -> "Current Status: Unknown - Location services disabled"
            }
            
            // Set text color based on status
            val textColor = when (status) {
                HomeViewModel.SafetyStatus.SAFE -> android.graphics.Color.GREEN
                HomeViewModel.SafetyStatus.WARNING -> android.graphics.Color.YELLOW
                HomeViewModel.SafetyStatus.DANGER -> android.graphics.Color.RED
                HomeViewModel.SafetyStatus.UNKNOWN -> android.graphics.Color.GRAY
            }
            safetyStatusTextView.setTextColor(textColor)
        }
    }

    override fun onResume() {
        super.onResume()
        // Refresh safety status when fragment becomes visible
        viewModel.checkSafetyStatus()
    }
}
package com.touristapp.ui.map

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.touristapp.R

class MapFragment : Fragment() {

    private lateinit var viewModel: MapViewModel
    private lateinit var mapStatusTextView: TextView
    private lateinit var currentZoneTextView: TextView
    private lateinit var refreshButton: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_map, container, false)
        
        // Initialize views
        mapStatusTextView = view.findViewById(R.id.map_status_text_view)
        currentZoneTextView = view.findViewById(R.id.current_zone_text_view)
        refreshButton = view.findViewById(R.id.refresh_button)
        
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(MapViewModel::class.java)
        
        // Load safety zones
        viewModel.loadSafetyZones()
        
        // Set up click listeners
        refreshButton.setOnClickListener {
            viewModel.refreshLocation()
        }
        
        // Observe map status
        viewModel.mapStatus.observe(viewLifecycleOwner) { status ->
            mapStatusTextView.text = when (status) {
                MapViewModel.MapStatus.LOADING -> "Loading map data..."
                MapViewModel.MapStatus.LOADED -> "Map data loaded successfully"
                MapViewModel.MapStatus.ERROR -> "Failed to load map data"
            }
        }
        
        // Observe current zone
        viewModel.currentZone.observe(viewLifecycleOwner) { zone ->
            if (zone != null) {
                currentZoneTextView.text = "Current Zone: ${zone.name} (${zone.safetyLevel})"
                
                // Set text color based on safety level
                val textColor = when (zone.safetyLevel) {
                    "safe" -> android.graphics.Color.GREEN
                    "warning" -> android.graphics.Color.YELLOW
                    "danger" -> android.graphics.Color.RED
                    else -> android.graphics.Color.GRAY
                }
                currentZoneTextView.setTextColor(textColor)
            } else {
                currentZoneTextView.text = "Current Zone: Unknown"
                currentZoneTextView.setTextColor(android.graphics.Color.GRAY)
            }
        }
        
        // Observe operation result
        viewModel.operationResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is MapViewModel.OperationResult.Success -> {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is MapViewModel.OperationResult.Error -> {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is MapViewModel.OperationResult.Loading -> {
                    // Show loading indicator
                }
                is MapViewModel.OperationResult.Idle -> {
                    // Reset UI state
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Refresh location when fragment becomes visible
        viewModel.refreshLocation()
    }
}
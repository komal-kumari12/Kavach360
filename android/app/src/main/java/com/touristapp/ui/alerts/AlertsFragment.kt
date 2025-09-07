package com.touristapp.ui.alerts

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.touristapp.R
import com.touristapp.data.models.SafetyAlert

class AlertsFragment : Fragment() {

    private lateinit var viewModel: AlertsViewModel
    private lateinit var alertsRecyclerView: RecyclerView
    private lateinit var noAlertsTextView: TextView
    private lateinit var refreshButton: Button
    private lateinit var alertsAdapter: AlertsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_alerts, container, false)
        
        // Initialize views
        alertsRecyclerView = view.findViewById(R.id.alerts_recycler_view)
        noAlertsTextView = view.findViewById(R.id.no_alerts_text_view)
        refreshButton = view.findViewById(R.id.refresh_button)
        
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(AlertsViewModel::class.java)
        
        // Set up RecyclerView
        alertsAdapter = AlertsAdapter(emptyList())
        alertsRecyclerView.layoutManager = LinearLayoutManager(context)
        alertsRecyclerView.adapter = alertsAdapter
        
        // Load alerts
        viewModel.loadAlerts()
        
        // Set up click listeners
        refreshButton.setOnClickListener {
            viewModel.loadAlerts()
        }
        
        // Observe alerts
        viewModel.alerts.observe(viewLifecycleOwner) { alerts ->
            if (alerts.isNullOrEmpty()) {
                alertsRecyclerView.visibility = View.GONE
                noAlertsTextView.visibility = View.VISIBLE
            } else {
                alertsRecyclerView.visibility = View.VISIBLE
                noAlertsTextView.visibility = View.GONE
                alertsAdapter.updateAlerts(alerts)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Refresh alerts when fragment becomes visible
        viewModel.loadAlerts()
    }

    // Adapter for the alerts RecyclerView
    private inner class AlertsAdapter(private var alerts: List<SafetyAlert>) : RecyclerView.Adapter<AlertsAdapter.AlertViewHolder>() {

        fun updateAlerts(newAlerts: List<SafetyAlert>) {
            alerts = newAlerts
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_alert, parent, false)
            return AlertViewHolder(view)
        }

        override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
            val alert = alerts[position]
            holder.bind(alert)
        }

        override fun getItemCount(): Int = alerts.size

        inner class AlertViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val titleTextView: TextView = itemView.findViewById(R.id.alert_title_text_view)
            private val messageTextView: TextView = itemView.findViewById(R.id.alert_message_text_view)
            private val timeTextView: TextView = itemView.findViewById(R.id.alert_time_text_view)
            private val severityTextView: TextView = itemView.findViewById(R.id.alert_severity_text_view)

            fun bind(alert: SafetyAlert) {
                titleTextView.text = alert.title
                messageTextView.text = alert.message
                timeTextView.text = alert.createdAt
                severityTextView.text = alert.severity.uppercase()
                
                // Set text color based on severity
                val textColor = when (alert.severity) {
                    "low" -> android.graphics.Color.GREEN
                    "medium" -> android.graphics.Color.YELLOW
                    "high" -> android.graphics.Color.RED
                    else -> android.graphics.Color.GRAY
                }
                severityTextView.setTextColor(textColor)
            }
        }
    }
}
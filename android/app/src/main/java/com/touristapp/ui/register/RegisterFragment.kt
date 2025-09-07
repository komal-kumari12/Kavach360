package com.touristapp.ui.register

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.touristapp.R
import com.touristapp.databinding.FragmentRegisterBinding

class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var viewModel: RegisterViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[RegisterViewModel::class.java]
        
        setupClickListeners()
        observeViewModel()
    }

    private fun setupClickListeners() {
        binding.registerButton.setOnClickListener {
            val username = binding.usernameEditText.text.toString().trim()
            val email = binding.emailEditText.text.toString().trim()
            val fullName = binding.fullNameEditText.text.toString().trim()
            val nationality = binding.nationalityEditText.text.toString().trim()
            val passportNumber = binding.passportEditText.text.toString().trim()
            val emergencyContact = binding.emergencyContactEditText.text.toString().trim()
            val password = binding.passwordEditText.text.toString().trim()
            val confirmPassword = binding.confirmPasswordEditText.text.toString().trim()
            
            if (username.isEmpty() || email.isEmpty() || fullName.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(context, "Please fill all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password != confirmPassword) {
                Toast.makeText(context, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (password.length < 8) {
                Toast.makeText(context, "Password must be at least 8 characters long", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            viewModel.register(
                username = username,
                email = email,
                fullName = fullName,
                nationality = nationality.ifEmpty { null },
                passportNumber = passportNumber.ifEmpty { null },
                emergencyContact = emergencyContact.ifEmpty { null },
                password = password
            )
        }
        
        binding.loginTextView.setOnClickListener {
            findNavController().navigate(R.id.action_registerFragment_to_loginFragment)
        }
    }

    private fun observeViewModel() {
        viewModel.registerResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is RegisterViewModel.RegisterResult.Success -> {
                    hideLoading()
                    Toast.makeText(context, "Registration successful. Please login.", Toast.LENGTH_SHORT).show()
                    findNavController().navigate(R.id.action_registerFragment_to_loginFragment)
                }
                is RegisterViewModel.RegisterResult.Error -> {
                    hideLoading()
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is RegisterViewModel.RegisterResult.Loading -> {
                    showLoading()
                }
                is RegisterViewModel.RegisterResult.Idle -> {
                    hideLoading()
                }
            }
        }
    }

    private fun showLoading() {
        binding.registerProgress.visibility = View.VISIBLE
        binding.registerButton.isEnabled = false
        binding.registerButton.text = "Registering..."
    }

    private fun hideLoading() {
        binding.registerProgress.visibility = View.GONE
        binding.registerButton.isEnabled = true
        binding.registerButton.text = "Register"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

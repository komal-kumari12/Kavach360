package com.touristapp.ui.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.touristapp.R
import com.touristapp.databinding.FragmentLoginBinding

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var viewModel: LoginViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[LoginViewModel::class.java]
        
        setupClickListeners()
        observeViewModel()
    }

    private fun setupClickListeners() {
        binding.loginButton.setOnClickListener {
            val username = binding.usernameEditText.text.toString().trim()
            val password = binding.passwordEditText.text.toString().trim()
            
            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(context, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            viewModel.login(username, password)
        }
        
        binding.registerTextView.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_registerFragment)
        }
    }

    private fun observeViewModel() {
        viewModel.loginResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is LoginViewModel.LoginResult.Success -> {
                    hideLoading()
                    Toast.makeText(context, "Login successful", Toast.LENGTH_SHORT).show()
                    findNavController().navigate(R.id.action_loginFragment_to_homeFragment)
                }
                is LoginViewModel.LoginResult.Error -> {
                    hideLoading()
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
                is LoginViewModel.LoginResult.Loading -> {
                    showLoading()
                }
                is LoginViewModel.LoginResult.Idle -> {
                    hideLoading()
                }
            }
        }
    }

    private fun showLoading() {
        binding.loginProgress.visibility = View.VISIBLE
        binding.loginButton.isEnabled = false
        binding.loginButton.text = "Logging in..."
    }

    private fun hideLoading() {
        binding.loginProgress.visibility = View.GONE
        binding.loginButton.isEnabled = true
        binding.loginButton.text = "Login"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

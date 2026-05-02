package com.vitalai.data.repository

import com.vitalai.data.local.TokenManager
import com.vitalai.data.remote.AuthApi
import com.vitalai.data.remote.model.AuthResponseDto
import com.vitalai.data.remote.model.LoginRequest
import com.vitalai.data.remote.model.RegisterRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenManager: TokenManager
) {
    suspend fun login(request: LoginRequest): Result<AuthResponseDto> {
        return try {
            val response = authApi.login(request)
            val body = response.body()?.data
            if (response.isSuccessful && body != null) {
                tokenManager.saveTokens(body.accessToken, body.refreshToken)
                Result.success(body)
            } else {
                Result.failure(Exception("Đăng nhập thất bại (${response.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(request: RegisterRequest): Result<AuthResponseDto> {
        return try {
            val response = authApi.register(request)
            val body = response.body()?.data
            if (response.isSuccessful && body != null) {
                tokenManager.saveTokens(body.accessToken, body.refreshToken)
                Result.success(body)
            } else {
                Result.failure(Exception("Đăng ký thất bại (${response.code()})"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        tokenManager.clearTokens()
    }
}

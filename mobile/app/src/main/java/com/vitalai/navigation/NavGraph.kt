package com.vitalai.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.vitalai.ui.components.VitalBottomNavBar
import com.vitalai.ui.screens.auth.SignInScreen
import com.vitalai.ui.screens.auth.SignUpScreen
import com.vitalai.ui.screens.auth.WelcomeScreen
import com.vitalai.ui.screens.onboarding.OnboardingScreen
import com.vitalai.ui.screens.home.HomeScreen
import androidx.compose.material3.Scaffold
import com.vitalai.ui.components.VitalTopAppBar

@Composable
fun VitalNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Welcome
    ) {
        composable<Screen.Welcome> {
            WelcomeScreen(navController)
        }
        composable<Screen.SignIn> {
            SignInScreen(navController)
        }
        composable<Screen.SignUp> {
            SignUpScreen(navController)
        }
        composable<Screen.Onboarding> { backStackEntry ->
            val onboarding: Screen.Onboarding = backStackEntry.toRoute()
            OnboardingScreen(onboarding.step, navController)
        }
        composable<Screen.Home> {
            HomeScreen(navController)
        }
        composable<Screen.Diary> {
            PlaceholderScreen(navController, "Nhật ký")
        }
        composable<Screen.Coach> {
            PlaceholderScreen(navController, "AI Coach")
        }
        composable<Screen.Profile> {
            PlaceholderScreen(navController, "Cá nhân")
        }
    }
}

@Composable
private fun PlaceholderScreen(navController: NavHostController, title: String) {
    Scaffold(
        topBar = { VitalTopAppBar(title = title) },
        bottomBar = { VitalBottomNavBar(navController = navController) }
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Tính năng đang phát triển",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

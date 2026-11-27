plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "br.com.lcfabrica.apps"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.lcfabrica.apps"
        minSdk = 23
        targetSdk = 35
        versionCode = 3
        versionName = "1.2.1"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

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
        versionCode = 5
        versionName = "1.2.3"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            versionNameSuffix = "-debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

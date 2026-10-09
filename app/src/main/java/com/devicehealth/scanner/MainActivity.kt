package com.devicehealth.scanner

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.telephony.TelephonyManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import org.json.JSONObject

class MainActivity : ComponentActivity() {

    companion object {
        init {
            System.loadLibrary("native-lib")
        }
    }

    private external fun getNativeCpuInfo(): String
    private external fun getNativeBatterySysHealth(): String
    private external fun getNativeMemInfo(): String
    private external fun getNativeSystemProps(): String

    private val permissionGranted = mutableStateOf(false)
    private val deviceModel = mutableStateOf("Scanning...")
    private val cpuArch = mutableStateOf("Detecting...")
    private val batteryHealth = mutableStateOf("Detecting...")
    private val imeiOrId = mutableStateOf("Pending Permission...")

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        permissionGranted.value = permissions[Manifest.permission.READ_PHONE_STATE] ?: false
        performScan()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        permissionGranted.value = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF090D16),
                    surface = Color(0xFF131A29),
                    primary = Color(0xFF10B981)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = "AegisDroid Health",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF10B981)
                        )
                        Text(
                            text = "Native Android C++ Hardware Diagnostics",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (!permissionGranted.value) {
                            Button(
                                onClick = {
                                    requestPermissionLauncher.launch(
                                        arrayOf(
                                            Manifest.permission.READ_PHONE_STATE,
                                            Manifest.permission.BATTERY_STATS
                                        )
                                    )
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Grant Phone State Permission")
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        Button(
                            onClick = { performScan() },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Scan Hardware via Native C++")
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        MetricCard("Device Model & Brand", deviceModel.value)
                        MetricCard("CPU Architecture & Cores", cpuArch.value)
                        MetricCard("Battery Power & Health", batteryHealth.value)
                        MetricCard("Device Identifier / IMEI", imeiOrId.value)
                    }
                }
            }
        }

        performScan()
    }

    private fun performScan() {
        Thread {
            try {
                val sysProps = JSONObject(getNativeSystemProps())
                val cpu = JSONObject(getNativeCpuInfo())
                val battery = JSONObject(getNativeBatterySysHealth())

                val brand = sysProps.optString("brand", Build.BRAND).capitalize()
                val model = sysProps.optString("model", Build.MODEL)
                val osVer = "Android " + sysProps.optString("androidVersion", Build.VERSION.RELEASE)

                var imeiResult = "Restricted (Android 10+ Privacy)"
                if (permissionGranted.value) {
                    val telephony = getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                        @Suppress("DEPRECATION")
                        imeiResult = telephony?.deviceId ?: "Unavailable"
                    } else {
                        imeiResult = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID) ?: "Protected"
                    }
                }

                runOnUiThread {
                    deviceModel.value = "$brand $model ($osVer)"
                    cpuArch.value = "${cpu.optString("arch", "ARM64")} - ${cpu.optInt("totalCores", 8)} Cores"
                    batteryHealth.value = "${battery.optInt("capacity", 85)}% · ${battery.optDouble("tempCelsius", 28.5)}°C · ${battery.optString("healthStatus", "Good")}"
                    imeiOrId.value = imeiResult
                }
            } catch (e: Exception) {
                // Ignore error
            }
        }.start()
    }

    @Composable
    fun MetricCard(label: String, value: String) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF131A29)),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(text = label, fontSize = 11.sp, color = Color(0xFF94A3B8))
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = value,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

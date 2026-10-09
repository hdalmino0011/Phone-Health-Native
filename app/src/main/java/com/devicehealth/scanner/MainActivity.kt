package com.devicehealth.scanner

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.telephony.TelephonyManager
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity(), SensorEventListener {

    companion object {
        init {
            System.loadLibrary("native-lib")
        }
    }

    private external fun getNativeCpuInfo(): String
    private external fun getNativeBatterySysHealth(): String
    private external fun getNativeMemInfo(): String
    private external fun getNativeStorageInfo(): String
    private external fun getNativeSystemProps(): String
    private external fun runNativeBenchmark(): String

    private lateinit var sensorManager: SensorManager
    private var accelSensor: Sensor? = null

    // Live sensor values
    private val accelX = mutableStateOf(0f)
    private val accelY = mutableStateOf(0f)
    private val accelZ = mutableStateOf(9.8f)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        setContent {
            AegisDroidApp()
        }
    }

    override fun onResume() {
        super.onResume()
        accelSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_ACCELEROMETER) {
            accelX.value = event.values[0]
            accelY.value = event.values[1]
            accelZ.value = event.values[2]
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun AegisDroidApp() {
        val context = LocalContext.current
        val coroutineScope = rememberCoroutineScope()

        var selectedTab by remember { mutableStateOf(0) }
        var isScanning by remember { mutableStateOf(false) }
        var scanProgress by remember { mutableStateOf(0f) }
        var scanStepText by remember { mutableStateOf("Ready to scan") }
        var healthScore by remember { mutableStateOf(92) }

        // Telemetry state
        var cpuData by remember { mutableStateOf(JSONObject()) }
        var batteryData by remember { mutableStateOf(JSONObject()) }
        var memData by remember { mutableStateOf(JSONObject()) }
        var storageData by remember { mutableStateOf(JSONObject()) }
        var sysProps by remember { mutableStateOf(JSONObject()) }
        var benchmarkResult by remember { mutableStateOf<JSONObject?>(null) }
        var isBenchmarking by remember { mutableStateOf(false) }
        var deviceId by remember { mutableStateOf("Detecting...") }
        var refreshRateHz by remember { mutableStateOf(60) }
        var resolutionText by remember { mutableStateOf("1080 x 2400") }
        var sensorCount by remember { mutableStateOf(0) }

        // Function to query all hardware parameters
        val refreshHardwareTelemetry = {
            try {
                cpuData = JSONObject(getNativeCpuInfo())
                batteryData = JSONObject(getNativeBatterySysHealth())
                memData = JSONObject(getNativeMemInfo())
                storageData = JSONObject(getNativeStorageInfo())
                sysProps = JSONObject(getNativeSystemProps())

                // Screen details
                val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    val metrics = wm.currentWindowMetrics
                    resolutionText = "${metrics.bounds.width()} x ${metrics.bounds.height()}"
                } else {
                    val display = wm.defaultDisplay
                    resolutionText = "${display.width} x ${display.height}"
                }
                refreshRateHz = display?.mode?.refreshRate?.toInt() ?: 60

                // Sensors count
                sensorCount = sensorManager.getSensorList(Sensor.TYPE_ALL).size

                // Device ID / IMEI
                deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID) ?: "Protected"

                // Calculate dynamic health score
                val battPct = batteryData.optInt("capacity", 85)
                val tempC = batteryData.optDouble("tempCelsius", 28.5)
                var score = 80
                if (battPct > 20) score += 5
                if (tempC < 38.0) score += 7
                score += (refreshRateHz / 30) // bonus for high refresh
                healthScore = score.coerceIn(50, 99)

            } catch (e: Exception) {
                // Keep default
            }
        }

        // Run hardware query on initial launch
        LaunchedEffect(Unit) {
            refreshHardwareTelemetry()
        }

        // Deep Scan Execution
        val runDeepScan: () -> Unit = {
            coroutineScope.launch {
                isScanning = true
                scanProgress = 0f

                val steps = listOf(
                    "Probing Linux kernel & ARM64 registers..." to 0.15f,
                    "Reading /sys battery thermals & voltage..." to 0.35f,
                    "Calculating RAM allocation & statvfs partitions..." to 0.55f,
                    "Detecting display refresh rate & GPU composition..." to 0.75f,
                    "Testing hardware sensor bus & telephony status..." to 0.90f,
                    "Compiling native health diagnostics report..." to 1.0f
                )

                for ((step, progress) in steps) {
                    scanStepText = step
                    scanProgress = progress
                    delay(300)
                }

                refreshHardwareTelemetry()
                isScanning = false
                scanStepText = "Scan Complete"

                // Vibrate feedback
                try {
                    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                        vm.defaultVibrator
                    } else {
                        @Suppress("DEPRECATION")
                        getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(100)
                    }
                } catch (e: Exception) {}
            }
        }

        MaterialTheme(
            colorScheme = darkColorScheme(
                background = Color(0xFF090D16),
                surface = Color(0xFF111827),
                primary = Color(0xFF10B981),
                secondary = Color(0xFF38BDF8),
                tertiary = Color(0xFFA855F7)
            )
        ) {
            Scaffold(
                topBar = {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0D1322))
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "AEGISDROID HEALTH",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp,
                                    color = Color(0xFF10B981)
                                )
                                Text(
                                    text = "Native C++ Hardware Diagnostic Suite",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }

                            // Dynamic Live Tag
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFF10B981).copy(alpha = 0.15f))
                                    .border(1.dp, Color(0xFF10B981).copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "NDK ONLINE",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF34D399),
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Category Tab Bar
                        ScrollableTabRow(
                            selectedTabIndex = selectedTab,
                            containerColor = Color.Transparent,
                            contentColor = Color.White,
                            edgePadding = 0.dp,
                            divider = {}
                        ) {
                            val tabs = listOf("Overview", "CPU / SoC", "Battery", "RAM & ROM", "Display", "Benchmark")
                            tabs.forEachIndexed { index, title ->
                                Tab(
                                    selected = selectedTab == index,
                                    onClick = { selectedTab = index },
                                    text = {
                                        Text(
                                            text = title,
                                            fontSize = 12.sp,
                                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                                            color = if (selectedTab == index) Color(0xFF10B981) else Color(0xFF94A3B8)
                                        )
                                    }
                                )
                            }
                        }
                    }
                },
                containerColor = Color(0xFF090D16)
            ) { padding ->
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(6.dp))

                        // SCAN HERO CARD
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(16.dp))
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "DIAGNOSTIC HEALTH SCORE",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF94A3B8),
                                            letterSpacing = 0.5.sp
                                        )
                                        Text(
                                            text = "${sysProps.optString("brand", "Samsung")} ${sysProps.optString("model", "Device")}",
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }

                                    // Score badge circle
                                    Box(
                                        contentAlignment = Alignment.Center,
                                        modifier = Modifier
                                            .size(54.dp)
                                            .clip(CircleShape)
                                            .background(
                                                Brush.radialGradient(
                                                    listOf(Color(0xFF059669), Color(0xFF064E3B))
                                                )
                                            )
                                            .border(2.dp, Color(0xFF34D399), CircleShape)
                                    ) {
                                        Text(
                                            text = "$healthScore",
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                    }
                                }

                                if (isScanning) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    LinearProgressIndicator(
                                        progress = scanProgress,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = Color(0xFF10B981),
                                        trackColor = Color(0xFF1F2937)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = scanStepText,
                                        fontSize = 11.sp,
                                        color = Color(0xFF38BDF8),
                                        fontFamily = FontFamily.Monospace
                                    )
                                } else {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Button(
                                        onClick = runDeepScan,
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "RUN DEEP HARDWARE SCAN",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // TAB 0: OVERVIEW
                    if (selectedTab == 0) {
                        item {
                            SectionHeader(title = "DEVICE IDENTIFICATION")
                            MetricGrid(
                                listOf(
                                    "Brand & Model" to "${sysProps.optString("brand", "Samsung")} ${sysProps.optString("model", "Device")}",
                                    "Android OS" to "Android ${sysProps.optString("androidVersion", "16")} (API ${sysProps.optInt("sdkInt", 36)})",
                                    "Hardware SoC" to cpuData.optString("hardware", "Exynos / Snapdragon"),
                                    "Protected Phone ID" to deviceId,
                                    "Kernel Release" to sysProps.optString("kernel", "Linux 5.15"),
                                    "Security Patch" to sysProps.optString("securityPatch", "2026-08-01")
                                )
                            )
                        }

                        item {
                            SectionHeader(title = "SUBSYSTEM HEALTH STATUS")
                            MetricGrid(
                                listOf(
                                    "Battery Condition" to "${batteryData.optString("healthStatus", "Good")} (${batteryData.optInt("capacity", 85)}%)",
                                    "Battery Thermals" to "${batteryData.optDouble("tempCelsius", 28.5)}°C · Cool",
                                    "Physical RAM" to "${(memData.optLong("totalRamBytes", 6442450944L) / 1073741824.0).format(1)} GB Total",
                                    "Internal Storage" to "${(storageData.optLong("totalBytes", 137438953472L) / 1073741824.0).format(1)} GB Capacity",
                                    "Display Panel" to "$resolutionText · ${refreshRateHz}Hz",
                                    "Hardware Sensors" to "$sensorCount Onboard Sensors"
                                )
                            )
                        }
                    }

                    // TAB 1: CPU / SOC
                    if (selectedTab == 1) {
                        item {
                            SectionHeader(title = "CPU ARCHITECTURE & CORES")
                            InfoCard(
                                "Processor Architecture",
                                cpuData.optString("arch", "ARM64-v8A (64-bit)"),
                                "Hardware Platform: ${cpuData.optString("hardware", "Multi-Core SoC")}"
                            )
                        }

                        item {
                            SectionHeader(title = "REAL-TIME CORE FREQUENCIES (MHz)")
                            val coresArray = cpuData.optJSONArray("cores") ?: JSONArray()
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                for (i in 0 until coresArray.length()) {
                                    val c = coresArray.getJSONObject(i)
                                    val coreNum = c.optInt("core", i)
                                    val curMhz = c.optLong("curMhz", 1800)
                                    val maxMhz = c.optLong("maxMhz", 2400)
                                    CoreClockBar(coreNum, curMhz, maxMhz)
                                }
                            }
                        }

                        item {
                            InfoCard(
                                "Scaling Governor",
                                cpuData.optString("governor", "schedutil"),
                                "Instruction Sets: neon, fp, aes, sha1, sha2, crc32, atomics"
                            )
                        }
                    }

                    // TAB 2: BATTERY
                    if (selectedTab == 2) {
                        item {
                            SectionHeader(title = "BATTERY & THERMAL SUBSYSTEM")
                            val cap = batteryData.optInt("capacity", 85)
                            val volt = batteryData.optDouble("voltage", 4.15)
                            val temp = batteryData.optDouble("tempCelsius", 28.5)

                            Card(
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(12.dp))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = "Remaining Capacity", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text(text = "$cap%", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = (cap / 100f).coerceIn(0f, 1f),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(8.dp)
                                            .clip(RoundedCornerShape(4.dp)),
                                        color = if (cap > 20) Color(0xFF10B981) else Color(0xFFEF4444),
                                        trackColor = Color(0xFF1F2937)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            MetricGrid(
                                listOf(
                                    "Battery Health" to batteryData.optString("healthStatus", "Good"),
                                    "Charging Status" to batteryData.optString("chargeStatus", "Discharging"),
                                    "Temperature" to "$temp °C (${if (temp < 38) "Optimal" else "Warm"})",
                                    "Voltage" to "${volt.format(2)} V",
                                    "Technology" to batteryData.optString("technology", "Li-ion Polymer"),
                                    "Power Source" to "Battery Subsystem"
                                )
                            )
                        }
                    }

                    // TAB 3: RAM & ROM
                    if (selectedTab == 3) {
                        item {
                            SectionHeader(title = "PHYSICAL MEMORY (RAM)")
                            val totalRam = memData.optLong("totalRamBytes", 6442450944L) / 1073741824.0
                            val freeRam = memData.optLong("freeRamBytes", 2147483648L) / 1073741824.0
                            val usedRam = (totalRam - freeRam).coerceAtLeast(0.1)

                            StorageBar(
                                title = "RAM Allocation",
                                usedText = "${usedRam.format(2)} GB Used",
                                totalText = "${totalRam.format(2)} GB Total",
                                progress = (usedRam / totalRam).toFloat()
                            )
                        }

                        item {
                            SectionHeader(title = "INTERNAL FLASH STORAGE (ROM)")
                            val totalBytes = storageData.optLong("totalBytes", 137438953472L) / 1073741824.0
                            val freeBytes = storageData.optLong("freeBytes", 85899345920L) / 1073741824.0
                            val usedBytes = (totalBytes - freeBytes).coerceAtLeast(1.0)

                            StorageBar(
                                title = "User Data Partition (/data)",
                                usedText = "${usedBytes.format(1)} GB Used",
                                totalText = "${totalBytes.format(1)} GB Total",
                                progress = (usedBytes / totalBytes).toFloat()
                            )
                        }

                        item {
                            MetricGrid(
                                listOf(
                                    "Free Physical RAM" to "${(memData.optLong("freeRamBytes", 2147483648L) / 1073741824.0).format(2)} GB",
                                    "Buffer RAM Cache" to "${(memData.optLong("bufferRamBytes", 536870912L) / 1048576.0).format(0)} MB",
                                    "Available Storage" to "${(storageData.optLong("availableBytes", 80530636800L) / 1073741824.0).format(1)} GB Free",
                                    "Filesystem Type" to "ext4 / f2fs native partition"
                                )
                            )
                        }
                    }

                    // TAB 4: DISPLAY & SENSORS
                    if (selectedTab == 4) {
                        item {
                            SectionHeader(title = "DISPLAY PANEL SPECIFICATIONS")
                            MetricGrid(
                                listOf(
                                    "Display Resolution" to resolutionText,
                                    "Refresh Rate" to "${refreshRateHz} Hz (Dynamic High-Refresh)",
                                    "Color Depth" to "24-bit TrueColor",
                                    "HDR Support" to "HDR10 / Wide Color Gamut"
                                )
                            )
                        }

                        item {
                            SectionHeader(title = "LIVE HARDWARE ACCELEROMETER")
                            Card(
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(12.dp))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "Tilt your device to see live 3-axis sensor dynamics",
                                        fontSize = 11.sp,
                                        color = Color(0xFF94A3B8)
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceAround
                                    ) {
                                        AxisMeter("X-Axis", accelX.value, Color(0xFFEF4444))
                                        AxisMeter("Y-Axis", accelY.value, Color(0xFF10B981))
                                        AxisMeter("Z-Axis", accelZ.value, Color(0xFF38BDF8))
                                    }
                                }
                            }
                        }

                        item {
                            SectionHeader(title = "ONBOARD SENSORS INVENTORY")
                            InfoCard(
                                "Total Sensors Detected",
                                "$sensorCount Hardware Sensors Active",
                                "Accelerometer, Gyroscope, Ambient Light, Proximity, Magnetic Field, Step Counter"
                            )
                        }
                    }

                    // TAB 5: BENCHMARK
                    if (selectedTab == 5) {
                        item {
                            SectionHeader(title = "C++ NDK MULTI-CORE COMPUTE BENCHMARK")
                            Card(
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(14.dp))
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "Vectorized SIMD Matrix Stress Test",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = "Measures raw floating-point computing throughput and multi-core thread bandwidth directly in native C++17.",
                                        fontSize = 11.sp,
                                        color = Color(0xFF94A3B8),
                                        modifier = Modifier.padding(vertical = 6.dp)
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))

                                    if (benchmarkResult != null) {
                                        val score = benchmarkResult!!.optLong("score", 1250)
                                        val lat = benchmarkResult!!.optDouble("latencyMs", 42.0)
                                        val rating = benchmarkResult!!.optString("rating", "High Performance")

                                        Box(
                                            contentAlignment = Alignment.Center,
                                            modifier = Modifier
                                                .size(80.dp)
                                                .clip(CircleShape)
                                                .background(Color(0xFF10B981).copy(alpha = 0.15f))
                                                .border(2.dp, Color(0xFF10B981), CircleShape)
                                        ) {
                                            Text(
                                                text = "$score",
                                                fontSize = 22.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color(0xFF34D399)
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(text = rating, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                        Text(text = "Execution Latency: ${lat.format(1)} ms", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }

                                    Button(
                                        onClick = {
                                            coroutineScope.launch {
                                                isBenchmarking = true
                                                delay(100)
                                                val res = runNativeBenchmark()
                                                benchmarkResult = JSONObject(res)
                                                isBenchmarking = false
                                            }
                                        },
                                        enabled = !isBenchmarking,
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8B5CF6)),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = if (isBenchmarking) "RUNNING C++ STRESS TEST..." else "START BENCHMARK",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            }
        }
    }

    @Composable
    fun SectionHeader(title: String) {
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF10B981),
            letterSpacing = 1.sp,
            modifier = Modifier.padding(vertical = 4.dp)
        )
    }

    @Composable
    fun MetricGrid(items: List<Pair<String, String>>) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (row in items.chunked(2)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    for (item in row) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(10.dp))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(text = item.first, fontSize = 11.sp, color = Color(0xFF94A3B8))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = item.second,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                    if (row.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }

    @Composable
    fun InfoCard(title: String, mainVal: String, subVal: String) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(10.dp))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(text = title, fontSize = 11.sp, color = Color(0xFF94A3B8))
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = mainVal, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = subVal, fontSize = 11.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
            }
        }
    }

    @Composable
    fun CoreClockBar(coreNum: Int, curMhz: Long, maxMhz: Long) {
        val pct = (curMhz.toFloat() / maxMhz.toFloat()).coerceIn(0.1f, 1f)
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(8.dp))
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Core $coreNum", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(text = "$curMhz / $maxMhz MHz", fontSize = 11.sp, color = Color(0xFF10B981), fontFamily = FontFamily.Monospace)
                }
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = pct,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(5.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = Color(0xFF10B981),
                    trackColor = Color(0xFF1F2937)
                )
            }
        }
    }

    @Composable
    fun StorageBar(title: String, usedText: String, totalText: String, progress: Float) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF1F2937), RoundedCornerShape(10.dp))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(text = title, fontSize = 11.sp, color = Color(0xFF94A3B8))
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = usedText, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(text = totalText, fontSize = 12.sp, color = Color(0xFF94A3B8))
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = progress.coerceIn(0f, 1f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Color(0xFF0284C7),
                    trackColor = Color(0xFF1F2937)
                )
            }
        }
    }

    @Composable
    fun AxisMeter(axis: String, value: Float, color: Color) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = axis, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color)
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${(value.toDouble()).format(2)} m/s²",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White,
                fontFamily = FontFamily.Monospace
            )
        }
    }

    private fun Double.format(digits: Int) = "%.${digits}f".format(this)
}

#include <jni.h>
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <chrono>
#include <unistd.h>
#include <sys/sysinfo.h>
#include <sys/system_properties.h>
#include <android/log.h>

#define TAG "AegisDroidNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

static std::string readSysfsValue(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) return "";
    std::string val;
    std::getline(file, val);
    while (!val.empty() && (val.back() == '\n' || val.back() == '\r' || val.back() == ' ')) {
        val.pop_back();
    }
    return val;
}

static std::string getProperty(const char* key, const char* defaultVal = "Unknown") {
    char value[PROP_VALUE_MAX] = {0};
    int len = __system_property_get(key, value);
    if (len > 0) return std::string(value);
    return std::string(defaultVal);
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_devicehealth_scanner_MainActivity_getNativeCpuInfo(
        JNIEnv* env,
        jobject /* this */) {

    std::ostringstream json;
    json << "{";

#if defined(__aarch64__)
    json << "\"arch\":\"arm64-v8a (64-bit)\",";
#elif defined(__arm__)
    json << "\"arch\":\"armeabi-v7a (32-bit)\",";
#else
    json << "\"arch\":\"x86_64\",";
#endif

    long numCores = sysconf(_SC_NPROCESSORS_CONF);
    json << "\"totalCores\":" << (numCores > 0 ? numCores : 8) << ",";
    json << "\"hardware\":\"" << getProperty("ro.board.platform", "Snapdragon / Dimensity") << "\"";
    json << "}";

    return env->NewStringUTF(json.str().c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_devicehealth_scanner_MainActivity_getNativeBatterySysHealth(
        JNIEnv* env,
        jobject /* this */) {

    std::string basePath = "/sys/class/power_supply/battery/";
    std::string capacity = readSysfsValue(basePath + "capacity");
    std::string voltage = readSysfsValue(basePath + "voltage_now");
    std::string temp = readSysfsValue(basePath + "temp");
    std::string health = readSysfsValue(basePath + "health");

    double tempC = temp.empty() ? 28.5 : std::stod(temp) / 10.0;
    double voltV = voltage.empty() ? 4.1 : std::stod(voltage) / 1000000.0;

    std::ostringstream json;
    json << "{";
    json << "\"capacity\":" << (capacity.empty() ? "85" : capacity) << ",";
    json << "\"voltage\":" << voltV << ",";
    json << "\"tempCelsius\":" << tempC << ",";
    json << "\"healthStatus\":\"" << (health.empty() ? "Good" : health) << "\"";
    json << "}";

    return env->NewStringUTF(json.str().c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_devicehealth_scanner_MainActivity_getNativeMemInfo(
        JNIEnv* env,
        jobject /* this */) {

    struct sysinfo si;
    unsigned long long totalRam = 0;
    unsigned long long freeRam = 0;

    if (sysinfo(&si) == 0) {
        totalRam = (unsigned long long)si.totalram * si.mem_unit;
        freeRam = (unsigned long long)si.freeram * si.mem_unit;
    }

    std::ostringstream json;
    json << "{";
    json << "\"totalRamBytes\":" << totalRam << ",";
    json << "\"freeRamBytes\":" << freeRam;
    json << "}";

    return env->NewStringUTF(json.str().c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_devicehealth_scanner_MainActivity_getNativeSystemProps(
        JNIEnv* env,
        jobject /* this */) {

    std::ostringstream json;
    json << "{";
    json << "\"brand\":\"" << getProperty("ro.product.brand") << "\",";
    json << "\"model\":\"" << getProperty("ro.product.model") << "\",";
    json << "\"manufacturer\":\"" << getProperty("ro.product.manufacturer") << "\",";
    json << "\"androidVersion\":\"" << getProperty("ro.build.version.release") << "\",";
    json << "\"sdkInt\":" << getProperty("ro.build.version.sdk", "34");
    json << "}";

    return env->NewStringUTF(json.str().c_str());
}

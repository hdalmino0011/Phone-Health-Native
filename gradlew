#!/usr/bin/env sh
# Gradle wrapper script with automated bootstrap
set -e
APP_HOME=$(cd "$(dirname "$0")" && pwd)
WRAPPER_JAR="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

if [ ! -f "$WRAPPER_JAR" ]; then
    echo "Downloading Gradle wrapper jar..."
    mkdir -p "$APP_HOME/gradle/wrapper"
    curl -sLo "$WRAPPER_JAR" "https://services.gradle.org/distributions/gradle-8.2-bin.zip" || true
    if command -v gradle >/dev/null 2>&1; then
        gradle wrapper --gradle-version 8.2
    fi
fi

if [ -f "$WRAPPER_JAR" ]; then
    exec java -Xmx2048m -jar "$WRAPPER_JAR" "$@"
elif command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
else
    echo "Gradle wrapper initializing..."
    exec gradle "$@"
fi

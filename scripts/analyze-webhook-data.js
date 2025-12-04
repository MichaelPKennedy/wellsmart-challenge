#!/usr/bin/env node
import "dotenv/config";
import WebSocket from "ws";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
const COLLECTION_TIME = 10 * 60 * 1000; // 10 minutes

// In-memory statistics
let stats = {
  totalPoints: 0,
  timestamps: [],
  messageTypes: {},
  alarmTrue: {
    count: 0,
    flowValues: [],
    powerValues: [],
    pressureValues: [],
  },
  alarmFalse: {
    count: 0,
    flowValues: [],
    powerValues: [],
    pressureValues: [],
  },
};

function processDataPoint(data) {
  stats.totalPoints++;

  stats.timestamps.push(Date.now());

  // Track message types
  const msgType = data.message_type || "unknown";
  stats.messageTypes[msgType] = (stats.messageTypes[msgType] || 0) + 1;

  // Track alarm correlation
  if (data.sensor_alarm) {
    stats.alarmTrue.count++;
    stats.alarmTrue.flowValues.push(data.flow_gpm);
    stats.alarmTrue.powerValues.push(data.power_kW);
    stats.alarmTrue.pressureValues.push(data.pressure_psi);
  } else {
    stats.alarmFalse.count++;
    stats.alarmFalse.flowValues.push(data.flow_gpm);
    stats.alarmFalse.powerValues.push(data.power_kW);
    stats.alarmFalse.pressureValues.push(data.pressure_psi);
  }

  if (stats.totalPoints % 100 === 0) {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 1000 / 60);
    const seconds = Math.floor((elapsed / 1000) % 60);
    console.log(
      `[${minutes}m ${seconds}s] Received ${stats.totalPoints} data points`
    );
  }
}

// Create WebSocket connection
function createWebSocketConnection() {
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected to WebSocket server\n");
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      processDataPoint(data);
    } catch (err) {
      console.error("Failed to parse message:", err.message);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  return ws;
}

// Analysis functions
function analyzeRepetition() {
  if (stats.timestamps.length < 2) return null;

  const intervals = [];
  for (let i = 1; i < stats.timestamps.length; i++) {
    intervals.push(stats.timestamps[i] - stats.timestamps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const minInterval = Math.min(...intervals);
  const maxInterval = Math.max(...intervals);

  return {
    totalPoints: stats.totalPoints,
    averageIntervalMs: Math.round(avgInterval),
    averageIntervalSeconds: (avgInterval / 1000).toFixed(3),
    minIntervalMs: minInterval,
    maxIntervalMs: maxInterval,
    isConsistent: maxInterval - minInterval < 50,
  };
}

function getAverage(arr) {
  if (arr.length === 0) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function getMin(arr) {
  return arr.length === 0 ? "N/A" : Math.min(...arr).toFixed(2);
}

function getMax(arr) {
  return arr.length === 0 ? "N/A" : Math.max(...arr).toFixed(2);
}

function analyzeAlarmCorrelation() {
  const { alarmTrue, alarmFalse } = stats;

  if (alarmTrue.count === 0 || alarmFalse.count === 0) {
    return {
      note:
        alarmTrue.count === 0
          ? "All data has sensor_alarm=false"
          : "All data has sensor_alarm=true",
    };
  }

  // Calculate pressure threshold
  const lowestPsiWhenTrue = Math.min(...alarmTrue.pressureValues);
  const highestPsiWhenFalse = Math.max(...alarmFalse.pressureValues);

  return {
    alarmTrueCount: alarmTrue.count,
    alarmFalseCount: alarmFalse.count,
    whenAlarmTrue: {
      avgFlow: getAverage(alarmTrue.flowValues),
      avgPower: getAverage(alarmTrue.powerValues),
      avgPressure: getAverage(alarmTrue.pressureValues),
      minPressure: getMin(alarmTrue.pressureValues),
      maxPressure: getMax(alarmTrue.pressureValues),
      minFlow: getMin(alarmTrue.flowValues),
      maxFlow: getMax(alarmTrue.flowValues),
      minPower: getMin(alarmTrue.powerValues),
      maxPower: getMax(alarmTrue.powerValues),
    },
    whenAlarmFalse: {
      avgFlow: getAverage(alarmFalse.flowValues),
      avgPower: getAverage(alarmFalse.powerValues),
      avgPressure: getAverage(alarmFalse.pressureValues),
      minPressure: getMin(alarmFalse.pressureValues),
      maxPressure: getMax(alarmFalse.pressureValues),
      minFlow: getMin(alarmFalse.flowValues),
      maxFlow: getMax(alarmFalse.flowValues),
      minPower: getMin(alarmFalse.powerValues),
      maxPower: getMax(alarmFalse.powerValues),
    },
    pressureThresholdAnalysis: {
      lowestPsiWhenAlarmTrue: lowestPsiWhenTrue.toFixed(2),
      highestPsiWhenAlarmFalse: highestPsiWhenFalse.toFixed(2),
      possibleThreshold: `~${lowestPsiWhenTrue.toFixed(1)} PSI`,
    },
  };
}

function analyzeMessageTypes() {
  const nonStandardTypes = Object.keys(stats.messageTypes).filter(
    (t) => t !== "process_data"
  );

  return {
    messageTypes: stats.messageTypes,
    allStandardProcess: nonStandardTypes.length === 0,
    nonStandardTypes: nonStandardTypes.length > 0 ? nonStandardTypes : null,
  };
}

// Main execution
let startTime;

async function main() {
  if (!WS_URL) {
    console.error("❌ Error: NEXT_PUBLIC_WS_URL environment variable not set");
    console.error(
      "Please set NEXT_PUBLIC_WS_URL to your WebSocket URL (e.g., ws://localhost:3000/ws)"
    );
    process.exit(1);
  }

  console.log("🚀 Data Analysis Script (WebSocket Stream)");
  console.log(`📡 Connecting to: ${WS_URL}`);
  console.log(`⏱️  Will collect data for 10 minutes`);
  console.log("");

  startTime = Date.now();
  const ws = createWebSocketConnection();

  return new Promise((resolve) => {
    // Stop collection after 10 minutes
    setTimeout(() => {
      console.log("\n✋ Collection time complete!\n");
      ws.close();

      if (stats.totalPoints === 0) {
        console.log(
          "❌ No data collected. Make sure the WebSocket server is running at:",
          WS_URL
        );
        process.exit(1);
      }

      // Print analysis
      console.log("📊 ANALYSIS RESULTS\n");
      console.log("═".repeat(70));

      // 1. Repetition analysis
      console.log("\n1️⃣  DATA REPETITION ANALYSIS");
      console.log("─".repeat(70));
      const repetition = analyzeRepetition();
      console.log(`Total data points collected: ${repetition.totalPoints}`);
      console.log(
        `Average interval: ${repetition.averageIntervalSeconds}s (${repetition.averageIntervalMs}ms)`
      );
      console.log(`Min interval: ${repetition.minIntervalMs}ms`);
      console.log(`Max interval: ${repetition.maxIntervalMs}ms`);
      console.log(
        `Variation: ${repetition.maxIntervalMs - repetition.minIntervalMs}ms`
      );
      console.log(
        `Consistent timing: ${
          repetition.isConsistent ? "✅ Yes" : "⚠️  Varies"
        }`
      );

      // 2. Alarm correlation
      console.log("\n2️⃣  SENSOR ALARM CORRELATION");
      console.log("─".repeat(70));
      const alarm = analyzeAlarmCorrelation();

      if (alarm.note) {
        console.log(`\n📌 ${alarm.note}`);
      } else {
        console.log(`\nData points with alarm=TRUE: ${alarm.alarmTrueCount}`);
        console.log(`Data points with alarm=FALSE: ${alarm.alarmFalseCount}`);

        console.log("\nWhen alarm is TRUE:");
        console.log(
          `  Flow: avg ${alarm.whenAlarmTrue.avgFlow} GPM (${alarm.whenAlarmTrue.minFlow}-${alarm.whenAlarmTrue.maxFlow})`
        );
        console.log(
          `  Power: avg ${alarm.whenAlarmTrue.avgPower} kW (${alarm.whenAlarmTrue.minPower}-${alarm.whenAlarmTrue.maxPower})`
        );
        console.log(
          `  Pressure: avg ${alarm.whenAlarmTrue.avgPressure} PSI (${alarm.whenAlarmTrue.minPressure}-${alarm.whenAlarmTrue.maxPressure})`
        );

        console.log("\nWhen alarm is FALSE:");
        console.log(
          `  Flow: avg ${alarm.whenAlarmFalse.avgFlow} GPM (${alarm.whenAlarmFalse.minFlow}-${alarm.whenAlarmFalse.maxFlow})`
        );
        console.log(
          `  Power: avg ${alarm.whenAlarmFalse.avgPower} kW (${alarm.whenAlarmFalse.minPower}-${alarm.whenAlarmFalse.maxPower})`
        );
        console.log(
          `  Pressure: avg ${alarm.whenAlarmFalse.avgPressure} PSI (${alarm.whenAlarmFalse.minPressure}-${alarm.whenAlarmFalse.maxPressure})`
        );

        console.log("\n🔍 Pressure Threshold Analysis:");
        console.log(
          `  Lowest PSI when alarm=TRUE: ${alarm.pressureThresholdAnalysis.lowestPsiWhenAlarmTrue}`
        );
        console.log(
          `  Highest PSI when alarm=FALSE: ${alarm.pressureThresholdAnalysis.highestPsiWhenAlarmFalse}`
        );
        console.log(
          `  → Possible threshold: ${alarm.pressureThresholdAnalysis.possibleThreshold}`
        );
      }

      // 3. Message types
      console.log("\n3️⃣  MESSAGE TYPE ANALYSIS");
      console.log("─".repeat(70));
      const types = analyzeMessageTypes();
      Object.entries(types.messageTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} messages`);
      });

      if (types.allStandardProcess) {
        console.log('\n✅ All messages are standard "process_data" type');
      } else {
        console.log("\n⚠️  Non-standard message types found:");
        types.nonStandardTypes.forEach((t) => {
          console.log(`  - ${t}: ${types.messageTypes[t]} messages`);
        });
      }

      console.log("\n" + "═".repeat(70));
      console.log("✨ Analysis complete!\n");

      resolve();
    }, COLLECTION_TIME);
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });

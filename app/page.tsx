"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { firestore, database } from "../lib/firebaseConfig";

type SensorData = {
  soilMoisture: string;
  soilPH: string;
  windSpeed: string;
  rainfall: string;
  radiation: string;
  soilTemperature: string;
  dhtTemperature: string;
  dhtHumidity: string;
};

type ForecastData = {
  today: string;
  day_1: string;
  day_2: string;
  day_3: string;
  day_4: string;
  day_5: string;
  day_6: string;
};

export default function WeatherForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: "Loading...",
    soilPH: "Loading...",
    windSpeed: "Loading...",
    rainfall: "Loading...",
    radiation: "Loading...",
    soilTemperature: "Loading...",
    dhtTemperature: "Loading...",
    dhtHumidity: "Loading...",
  });

  const loadSensorData = (sensorId: string, key: keyof SensorData) => {
    const sensorRef = ref(database, `sensor/${sensorId}`);
    onValue(sensorRef, (snapshot) => {
      const value = snapshot.val() || "0";
      setSensorData((prev) => ({ ...prev, [key]: value }));
    });
  };

  async function loadForecastData() {
    try {
      const docRef = doc(firestore, "forecasts", "weather_forecast");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ForecastData>;
        setForecast({
          today: data.today || "N/A",
          day_1: data.day_1 || "N/A",
          day_2: data.day_2 || "N/A",
          day_3: data.day_3 || "N/A",
          day_4: data.day_4 || "N/A",
          day_5: data.day_5 || "N/A",
          day_6: data.day_6 || "N/A",
        });
      } else {
        console.error("No such document!");
        setForecast(null);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setForecast(null);
    }
  }

  useEffect(() => {
    loadSensorData("kelembaban_tanah", "soilMoisture");
    loadSensorData("ph_tanah", "soilPH");
    loadSensorData("kecepatan_angin", "windSpeed");
    loadSensorData("curah_hujan", "rainfall");
    loadSensorData("radiasi", "radiation");
    loadSensorData("suhu", "soilTemperature");
    loadSensorData("dht_temperature", "dhtTemperature");
    loadSensorData("dht_humidity", "dhtHumidity");

    loadForecastData();
  }, []);

  // Pilih gambar berdasarkan kondisi cuaca
  const getWeatherImage = (condition: string) => {
    if (condition.toLowerCase().includes("hujan")) {
      return "/assets/weather/rain.png";
    } else if (condition.toLowerCase().includes("mendung")) {
      return "/assets/weather/cloud.png";
    } else if (condition.toLowerCase().includes("cerah")) {
      return "/assets/weather/sunny.png";
    }
    return "/assets/weather/default.png"; // Default image if no match
  };

  return (
    <div className="bg-gray-100 min-h-screen justify-center items-center p-6">
      <h5 className="text-xl text-black font-bold mb-4 text-center">
        Live Camera
      </h5>
      <div className="mb-6 flex justify-center items-center">
        <iframe
          src="http://192.168.171.79/"
          className="camera-iframe"
          style={{
            width: "100%",
            maxWidth: "650px",
            height: "400px",
            border: "3px solid blue",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      <h5 className="text-xl text-black font-bold mb-4">Monitoring Sensor</h5>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(sensorData).map(([key, value], index) => {
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-red-500",
            "bg-yellow-500",
            "bg-purple-500",
            "bg-teal-500",
            "bg-orange-500",
          ];
          const color = colors[index % colors.length];
          return (
            <div
              key={key}
              className={`${color} p-4 rounded-lg shadow-lg text-center text-white`}
            >
              <p className="text-lg">{key.replace(/([A-Z])/g, " $1")}</p>
              <h5 className="text-3xl font-bold">{value}</h5>
            </div>
          );
        })}
      </div>

      <div className="bg-sky-300 p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Cuaca Terkini</h2>
            <p className="text-lg text-gray-600">
              {forecast?.today || "Loading..."}
            </p>
            <p className="text-4xl font-bold text-yellow-500">
              {sensorData.dhtTemperature}
            </p>
          </div>
          <img
            src={getWeatherImage(forecast?.today || "default")}
            alt="Weather"
            className="w-20 h-20"
          />
        </div>
        <h3 className="text-lg font-semibold mb-2">6 Hari Kedepan</h3>
        <ul className="space-y-3">
          {forecast
            ? Object.entries(forecast)
                .filter(([key]) => key !== "today")
                .map(([key, value]) => (
                  <li key={key} className="flex justify-between items-center">
                    <span className="font-semibold">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span>{value}</span>
                  </li>
                ))
            : "Loading..."}
        </ul>
      </div>
    </div>
  );
}

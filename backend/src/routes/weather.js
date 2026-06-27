const express = require('express');
const axios = require('axios');

const router = express.Router();

const CACHE_TTL = 15 * 60 * 1000;
const cache = new Map();

const WMO_LABELS = {
  0: 'Açık',
  1: 'Çoğunlukla açık',
  2: 'Parçalı bulutlu',
  3: 'Kapalı',
  45: 'Sisli',
  48: 'Kırağı sis',
  51: 'Hafif çisenti',
  53: 'Çisenti',
  55: 'Yoğun çisenti',
  56: 'Hafif donan çisenti',
  57: 'Donan çisenti',
  61: 'Hafif yağmur',
  63: 'Yağmur',
  65: 'Kuvvetli yağmur',
  66: 'Hafif donan yağmur',
  67: 'Donan yağmur',
  71: 'Hafif kar',
  73: 'Kar',
  75: 'Yoğun kar',
  77: 'Kar taneleri',
  80: 'Hafif sağanak',
  81: 'Sağanak',
  82: 'Kuvvetli sağanak',
  85: 'Hafif kar sağanağı',
  86: 'Kuvvetli kar sağanağı',
  95: 'Fırtına',
  96: 'Dolu ile fırtına',
  99: 'Şiddetli dolu ile fırtına',
};

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 300) {
    cache.delete(cache.keys().next().value);
  }
}

function weatherDescription(code) {
  return WMO_LABELS[code] || 'Bilinmiyor';
}

function isRainCode(code) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
}

function buildPicnicTip({ weatherCode, precipitation, precipProbability, windSpeed, temperature }) {
  const tips = [];
  let suitable = true;

  if (isRainCode(weatherCode) || precipitation > 0.5 || precipProbability >= 60) {
    tips.push('Yağış bekleniyor; piknik için uygun olmayabilir.');
    suitable = false;
  }
  if (windSpeed >= 40) {
    tips.push('Kuvvetli rüzgar var; çadır ve hafif eşyalara dikkat edin.');
    suitable = false;
  } else if (windSpeed >= 25) {
    tips.push('Rüzgarlı hava bekleniyor.');
  }
  if (temperature !== null && temperature < 8) {
    tips.push('Hava oldukça soğuk; sıcak giysi önerilir.');
  }
  if (temperature !== null && temperature > 34) {
    tips.push('Çok sıcak; gölgede kalın ve bol su için.');
  }

  if (tips.length === 0) {
    return { picnicTip: 'Hava piknik için uygun görünüyor.', picnicSuitable: true };
  }

  return { picnicTip: tips.join(' '), picnicSuitable: suitable };
}

function mapSnapshot({
  temperature,
  apparentTemperature,
  humidity,
  precipitation,
  precipProbability,
  weatherCode,
  windSpeed,
  windDirection,
  time,
}) {
  const picnic = buildPicnicTip({
    weatherCode,
    precipitation: precipitation ?? 0,
    precipProbability: precipProbability ?? 0,
    windSpeed: windSpeed ?? 0,
    temperature,
  });

  return {
    time,
    temperature: temperature ?? null,
    apparentTemperature: apparentTemperature ?? null,
    humidity: humidity ?? null,
    precipitation: precipitation ?? 0,
    precipProbability: precipProbability ?? null,
    weatherCode: weatherCode ?? null,
    description: weatherCode != null ? weatherDescription(weatherCode) : 'Bilinmiyor',
    windSpeed: windSpeed ?? null,
    windDirection: windDirection ?? null,
    ...picnic,
  };
}

function findHourlyIndex(times, targetIso) {
  if (!Array.isArray(times) || !targetIso) return -1;
  const target = new Date(targetIso).getTime();
  let bestIdx = -1;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i += 1) {
    const diff = Math.abs(new Date(times[i]).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

async function fetchOpenMeteo(lat, lon) {
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
      ].join(','),
      timezone: 'Europe/Istanbul',
      forecast_days: 7,
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
    },
    timeout: 15000,
  });

  return response.data;
}

router.get('/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const date = req.query.date || null;
    const at = req.query.at || null;

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: 'lat ve lon zorunludur.',
      });
    }

    const cacheKey = `${lat.toFixed(4)}:${lon.toFixed(4)}:${date || 'now'}:${at || ''}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const data = await fetchOpenMeteo(lat, lon);

    if (at) {
      const idx = findHourlyIndex(data.hourly?.time, at);
      if (idx < 0) {
        return res.status(404).json({
          success: false,
          message: 'Seçilen zaman için hava tahmini bulunamadı.',
        });
      }

      const forecast = mapSnapshot({
        time: data.hourly.time[idx],
        temperature: data.hourly.temperature_2m?.[idx],
        apparentTemperature: data.hourly.temperature_2m?.[idx],
        humidity: data.hourly.relative_humidity_2m?.[idx],
        precipitation: data.hourly.precipitation?.[idx],
        precipProbability: data.hourly.precipitation_probability?.[idx],
        weatherCode: data.hourly.weather_code?.[idx],
        windSpeed: data.hourly.wind_speed_10m?.[idx],
        windDirection: data.hourly.wind_direction_10m?.[idx],
      });

      const payload = {
        success: true,
        mode: 'forecast',
        location: { lat, lon },
        at: data.hourly.time[idx],
        forecast,
      };
      setCache(cacheKey, payload);
      return res.json(payload);
    }

    const current = data.current
      ? mapSnapshot({
          time: data.current.time,
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          precipitation: data.current.precipitation,
          precipProbability: null,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
        })
      : null;

    let daily = null;
    if (date && Array.isArray(data.daily?.time)) {
      const dayIdx = data.daily.time.indexOf(date);
      if (dayIdx >= 0) {
        daily = mapSnapshot({
          time: data.daily.time[dayIdx],
          temperature: data.daily.temperature_2m_max?.[dayIdx],
          apparentTemperature: data.daily.temperature_2m_min?.[dayIdx],
          humidity: null,
          precipitation: data.daily.precipitation_sum?.[dayIdx],
          precipProbability: null,
          weatherCode: data.daily.weather_code?.[dayIdx],
          windSpeed: data.daily.wind_speed_10m_max?.[dayIdx],
          windDirection: null,
        });
        daily.temperatureMin = data.daily.temperature_2m_min?.[dayIdx] ?? null;
        daily.temperatureMax = data.daily.temperature_2m_max?.[dayIdx] ?? null;
      }
    }

    const payload = {
      success: true,
      mode: 'current',
      location: { lat, lon },
      date: date || data.current?.time?.slice(0, 10) || null,
      current,
      daily,
    };

    setCache(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    console.error('Hava durumu hatası:', error.message);
    res.status(502).json({
      success: false,
      message: 'Hava durumu verisi alınamadı. Lütfen daha sonra tekrar deneyin.',
    });
  }
});

module.exports = router;

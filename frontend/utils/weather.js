import { getApiBaseUrl } from '../config/api';

export function getParkCoords(park) {
  if (!park) return null;
  const lat = park.lat ?? park.latitude;
  const lon = park.lon ?? park.longitude;
  const nLat = typeof lat === 'number' ? lat : Number(String(lat).replace(',', '.'));
  const nLon = typeof lon === 'number' ? lon : Number(String(lon).replace(',', '.'));
  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) return null;
  return { lat: nLat, lon: nLon };
}

function turkeyDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export async function fetchParkWeatherToday(park) {
  const coords = getParkCoords(park);
  if (!coords) {
    throw new Error('Bu park için konum bilgisi yok.');
  }

  const today = turkeyDateKey(new Date());
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/weather?lat=${coords.lat}&lon=${coords.lon}&date=${today}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Hava durumu alınamadı.');
  }

  return data;
}

export async function fetchParkWeatherForDateTime(park, dateTime) {
  const coords = getParkCoords(park);
  if (!coords) {
    throw new Error('Bu park için konum bilgisi yok.');
  }

  const at = dateTime instanceof Date ? dateTime.toISOString() : new Date(dateTime).toISOString();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/weather?lat=${coords.lat}&lon=${coords.lon}&at=${encodeURIComponent(at)}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Hava durumu alınamadı.');
  }

  return data;
}

export function weatherIconName(weatherCode) {
  if (weatherCode === 0) return 'sunny';
  if (weatherCode === 1 || weatherCode === 2) return 'partly-sunny';
  if (weatherCode === 3) return 'cloudy';
  if (weatherCode === 45 || weatherCode === 48) return 'cloud';
  if (isRainCode(weatherCode)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'snow';
  if ([95, 96, 99].includes(weatherCode)) return 'thunderstorm';
  return 'partly-sunny';
}

function isRainCode(code) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
}

export function windDirectionLabel(degrees) {
  if (degrees == null) return null;
  const dirs = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

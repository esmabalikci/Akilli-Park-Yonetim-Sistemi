export function getParkKey(park) {
  if (!park) return '';
  return String(park.id ?? park.name ?? 'unknown');
}

export function normalizeParkForStorage(park) {
  return {
    id: park.id,
    name: park.name,
    location: park.location,
    image: park.image,
    description: park.description,
    status: park.status,
    type: park.type,
    lat: park.lat ?? park.latitude,
    lon: park.lon ?? park.longitude,
    occupancyRate: park.occupancyRate,
    capacity: park.capacity,
    distance: park.distance,
    size_sqm: park.size_sqm,
  };
}

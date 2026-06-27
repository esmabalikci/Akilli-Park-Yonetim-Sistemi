import { apiFetch } from './apiClient';
import { getParkKey } from './parkKey';

export async function fetchParkReviews(park) {
  const parkKey = encodeURIComponent(getParkKey(park));
  const { response, data } = await apiFetch(`/api/surveys/park/${parkKey}`);

  if (!response.ok) {
    if (response.status === 404) {
      return {
        reviews: [],
        stats: { averageRating: 0, count: 0, distribution: {} },
        unavailable: true,
      };
    }
    throw new Error(data.message || `Değerlendirmeler yüklenemedi (${response.status}).`);
  }

  return {
    reviews: data.reviews || [],
    stats: data.stats || { averageRating: 0, count: 0, distribution: {} },
  };
}

export async function submitParkReview({ park, rating, text }) {
  const { response, data } = await apiFetch('/api/surveys', {
    method: 'POST',
    body: JSON.stringify({
      ParkOsmId: getParkKey(park),
      ParkName: park.name || 'Park',
      Rating: rating,
      Comments: text?.trim() || null,
      SourceType: 'park',
    }),
  });

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Değerlendirme kaydedilemedi.');
  }
  return data;
}

export async function updateParkReview({ reviewId, rating, text }) {
  const { response, data } = await apiFetch(`/api/surveys/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify({
      Rating: rating,
      Comments: text?.trim() || null,
    }),
  });

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Değerlendirme güncellenemedi.');
  }
  return data;
}

export async function deleteParkReview({ reviewId }) {
  const { response, data } = await apiFetch(`/api/surveys/${reviewId}`, {
    method: 'DELETE',
  });

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Değerlendirme silinemedi.');
  }
  return data;
}

export async function fetchPendingReservationSurveys() {
  const { response, data } = await apiFetch('/api/surveys/pending-reservation');
  if (!response.ok) {
    throw new Error(data.message || 'Bekleyen anketler yüklenemedi.');
  }
  return data.pending || [];
}

export async function submitReservationSurvey({ reservationId, rating, text }) {
  const { response, data } = await apiFetch('/api/surveys', {
    method: 'POST',
    body: JSON.stringify({
      ReservationId: reservationId,
      Rating: rating,
      Comments: text?.trim() || null,
    }),
  });

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Anket kaydedilemedi.');
  }
  return data;
}

export function ratingLabel(rating) {
  const labels = {
    1: 'Kötü',
    2: 'Orta',
    3: 'İyi',
    4: 'Çok İyi',
    5: 'Mükemmel',
  };
  return labels[rating] || '';
}

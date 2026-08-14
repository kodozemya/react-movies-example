/**
 * Усе, що стосується TMDB, зібрано в цьому файлі: адреса, токен, обробка
 * відповіді. Компоненти про TMDB не знають нічого — вони просто просять дані.
 *
 * Навіщо так: коли завтра зміниться версія API або з'явиться власний бекенд,
 * правити доведеться один файл, а не двадцять компонентів.
 */

const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Токен читається з .env через import.meta.env — так Vite підставляє
 * змінні оточення. Префікс VITE_ обов'язковий: без нього змінна
 * лишиться на боці збирача й у код браузера не потрапить.
 */
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

/** Бази для картинок: w500 для постера, w1280 для банера на сторінці деталей. */
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

/**
 * Виконує запит до TMDB.
 *
 * @param {string} path шлях без бази, напр. "/movie/popular?page=1"
 * @param {AbortSignal} [signal] сигнал для скасування запиту
 * @returns {Promise<unknown>} розібраний JSON
 */
export async function tmdbFetch(path, signal) {
  /*
    Зрозуміла помилка замість загадкової 401. Якщо токена немає,
    краще сказати про це прямо, ніж змусити студента гадати,
    чому TMDB відповідає «Invalid API key».
  */
  if (!TOKEN) {
    throw new Error(
      "Немає токена TMDB. Скопіюй .env.example у .env і встав туди свій токен.",
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
    },
    signal,
  });

  /*
    ГОЛОВНЕ: fetch НЕ кидає помилку на відповідь 404 чи 500.
    Він відхиляє проміс лише коли запит не відбувся взагалі —
    немає мережі, зірвано з'єднання. Тому res.ok перевіряють руками,
    інакше застосунок спробує намалювати помилку сервера як список фільмів.
  */
  if (!response.ok) {
    throw new Error(`TMDB відповів статусом ${response.status}`);
  }

  return response.json();
}

/**
 * Повна адреса постера.
 * @param {string | null} posterPath значення поля poster_path з відповіді TMDB
 * @returns {string | null} адреса або null, якщо постера немає
 */
export function posterUrl(posterPath) {
  // poster_path часто дорівнює null — тоді картка малює заглушку.
  return posterPath ? `${POSTER_BASE_URL}${posterPath}` : null;
}

/**
 * Повна адреса банера (широкого кадру) для сторінки деталей.
 * @param {string | null} backdropPath
 * @returns {string | null}
 */
export function backdropUrl(backdropPath) {
  return backdropPath ? `${BACKDROP_BASE_URL}${backdropPath}` : null;
}

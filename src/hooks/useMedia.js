import { useTmdb } from "./useTmdb.js";
import { findTab, normalizeMedia, onlyTitles, MIN_QUERY_LENGTH } from "../lib/media.js";

/**
 * Список для головної сторінки.
 *
 * Одна з двох речей: результати пошуку, якщо в полі щось є, або вміст
 * обраної вкладки, якщо поле порожнє. Компонентам про цю розвилку
 * знати не треба — вони просто отримують список.
 *
 * @param {string} tabId ідентифікатор вкладки: "all" | "movie" | "tv"
 * @param {string} query пошуковий запит ("" = показати вкладку)
 */
export function useMediaList(tabId, query) {
  /*
    Запит, коротший за MIN_QUERY_LENGTH, рахуємо порожнім: одна літера
    показує вкладку, а не тисячу випадкових збігів.
  */
  const trimmed = query.trim().length >= MIN_QUERY_LENGTH ? query.trim() : "";
  const tab = findTab(tabId);

  /*
    /search/multi шукає серед фільмів, серіалів і людей одразу — саме те,
    що потрібно полю «Пошук фільмів і серіалів» із макета.
    encodeURIComponent обов'язковий: назва може містити пробіли, & або
    кирилицю, і без кодування адреса просто зламається.
  */
  const path = trimmed
    ? `/search/multi?language=uk-UA&page=1&query=${encodeURIComponent(trimmed)}`
    : tab.path;

  const { data, isLoading, error } = useTmdb(path);

  /*
    Тип, який API не назве сам: у результатах вкладки «Фільми» це "movie",
    у пошуку й у «Усі» тип приходить у самій відповіді.
    */
  const fallbackType = trimmed || tab.id === "all" ? null : tab.id;

  const items = onlyTitles(data?.results ?? []).map((item) =>
    normalizeMedia(item, fallbackType),
  );

  return { items, isLoading, error, isSearching: trimmed !== "" };
}

/**
 * Деталі одного фільму або серіалу.
 *
 * Шлях залежить від типу: /movie/{id} або /tv/{id}. Це єдина відмінність,
 * і вона теж лишається тут, а не в компоненті сторінки.
 *
 * @param {"movie" | "tv" | undefined} mediaType
 * @param {string | undefined} id
 */
export function useMediaDetails(mediaType, id) {
  /*
    Адресу пише користувач, тож у ній може бути будь-що: /title/person/5,
    /title/фільм/abc. Тип, якого TMDB не знає, у запит не відправляємо —
    інакше отримали б 404 і повідомлення про помилку мережі там,
    де насправді просто неправильне посилання.
  */
  const isSupported = (mediaType === "movie" || mediaType === "tv") && Boolean(id);

  const { data, isLoading, error } = useTmdb(
    isSupported ? `/${mediaType}/${id}?language=uk-UA` : null,
  );

  /*
    isSupported повертаємо назовні окремо від error. Сторінка має сказати
    «такої сторінки немає», а не «не вдалося завантажити»: це різні речі
    для користувача, хоч результат на екрані й схожий — порожньо.

    Без цього прапорця сторінка не мала б ЖОДНОЇ ознаки, що пішло не так:
    запиту не було, тож error порожній, isLoading = false, data = null —
    і користувач дивився б на назавжди порожній екран.
  */
  if (!isSupported) return { details: null, isLoading: false, error, isSupported };

  if (!data) return { details: null, isLoading, error, isSupported };

  /*
    Тривалість теж названа по-різному: у фільму це число runtime,
    у серіала — масив episode_run_time (тривалість однієї серії).
  */
  const runtime = data.runtime ?? data.episode_run_time?.[0] ?? null;

  return {
    details: {
      ...normalizeMedia(data, mediaType),
      tagline: data.tagline ?? "",
      genres: data.genres ?? [],
      runtime,
      releaseDate: data.release_date ?? data.first_air_date ?? null,
    },
    isLoading,
    error,
    isSupported,
  };
}

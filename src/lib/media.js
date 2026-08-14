/**
 * Приведення відповідей TMDB до одного вигляду.
 *
 * Навіщо цей файл. У макеті три вкладки — «Усі», «Фільми», «Серіали», —
 * і TMDB віддає їх різними полями:
 *
 *   фільм:  { title, release_date, runtime }
 *   серіал: { name,  first_air_date, episode_run_time }
 *
 * Якби кожен компонент сам розбирався, що йому прийшло, перевірка
 * `item.title || item.name` розповзлася б по всьому проєкту — і зламалася б
 * у тому одному місці, де її забули. Тому різниця гаситься **один раз, тут**,
 * а далі весь застосунок працює з однією формою даних.
 */

/** Вкладки інтерфейсу та шляхи TMDB, що за ними стоять. */
export const TABS = [
  { id: "all", label: "Усі", path: "/trending/all/week?language=uk-UA" },
  { id: "movie", label: "Фільми", path: "/movie/popular?language=uk-UA&page=1" },
  { id: "tv", label: "Серіали", path: "/tv/popular?language=uk-UA&page=1" },
];

/** Вкладка за замовчуванням — коли в адресі нічого немає або написана дурниця. */
export const DEFAULT_TAB_ID = TABS[0].id;

/**
 * Знаходить вкладку за ідентифікатором.
 *
 * Значення приходить з адреси, а адресу пише користувач — тобто там може
 * бути будь-що, зокрема `?tab=котики`. Тому невідомий ідентифікатор тихо
 * перетворюється на вкладку за замовчуванням, а не ламає сторінку.
 *
 * @param {string | null | undefined} tabId
 * @returns {{ id: string, label: string, path: string }}
 */
export function findTab(tabId) {
  return TABS.find((tab) => tab.id === tabId) ?? TABS[0];
}

/**
 * Перетворює запис TMDB на однакову форму.
 *
 * @param {object} item сирий запис із відповіді
 * @param {"movie" | "tv" | null} fallbackType тип, коли API його не назвав
 * @returns {{
 *   id: number, mediaType: "movie" | "tv", title: string,
 *   posterPath: string | null, backdropPath: string | null,
 *   rating: number, year: string | null, overview: string
 * }}
 */
export function normalizeMedia(item, fallbackType = null) {
  /*
    /trending/all повертає media_type у кожному записі, а /movie/popular
    і /tv/popular — ні: там тип відомий із самого запиту. Тому спершу
    дивимось на відповідь, потім на те, звідки вона прийшла.
  */
  const mediaType = item.media_type ?? fallbackType ?? "movie";
  const releaseDate = item.release_date ?? item.first_air_date ?? "";

  return {
    id: item.id,
    mediaType,
    // Фільм має title, серіал — name. Обидва можуть бути відсутні в дивних записах.
    title: item.title ?? item.name ?? "Без назви",
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    rating: item.vote_average ?? 0,
    // Дата приходить як "2019-04-24"; беремо перші чотири символи — рік.
    year: releaseDate ? releaseDate.slice(0, 4) : null,
    overview: item.overview ?? "",
  };
}

/**
 * Український підпис типу — для хлібних крихт і поля «Тип».
 * @param {"movie" | "tv"} mediaType
 * @returns {string}
 */
export function mediaTypeLabel(mediaType) {
  return mediaType === "tv" ? "Серіал" : "Фільм";
}

/**
 * Відфільтровує те, що не є фільмом чи серіалом.
 *
 * /trending/all і /search/multi віддають ще й людей (media_type: "person").
 * Без цього рядка в сітці фільмів час від часу з'являлися б актори
 * із порожнім постером — і це виглядало б як помилка застосунку.
 *
 * /movie/popular і /tv/popular поля media_type не мають узагалі — там
 * `item.media_type` дорівнює undefined, що теж не "person", тож такі записи
 * проходять фільтр без окремої перевірки.
 *
 * @param {object[]} items
 * @returns {object[]}
 */
export function onlyTitles(items) {
  return items.filter((item) => item.media_type !== "person");
}

/**
 * Дата у вигляді, придатному для читання людиною.
 *
 * TMDB віддає дату рядком "2012-04-25". Показувати її як є — значить
 * показувати формат бази даних; українською це «25 квітня 2012 р.».
 *
 * Intl.DateTimeFormat — вбудований у браузер інструмент, окрема бібліотека
 * для цього не потрібна.
 *
 * @param {string | null} isoDate дата у форматі "YYYY-MM-DD"
 * @returns {string | null} читабельна дата або null, якщо дати немає
 */
export function formatDate(isoDate) {
  if (!isoDate) return null;

  const date = new Date(isoDate);

  // Некоректний рядок дає Invalid Date; краще не показати нічого, ніж «Invalid Date».
  if (Number.isNaN(date.getTime())) return null;

  /*
    timeZone: "UTC" обов'язковий. Рядок "2012-04-25" без часу браузер читає
    як опівніч ЗА UTC, а форматує вже за годинним поясом користувача. Тому
    в будь-якому поясі на захід від Гринвіча (обидві Америки) дата з'їхала б
    на добу назад: замість 25 квітня показалося б 24-те.
  */
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

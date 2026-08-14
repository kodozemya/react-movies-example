import { useEffect, useState } from "react";
import { tmdbFetch } from "../api/tmdb.js";

/**
 * Базовий хук запиту до TMDB. Уся робота з мережею — тут; хуки з useMedia.js
 * (useMediaList, useMediaDetails) лише підставляють свій шлях.
 *
 * Хук повертає три речі, і саме ці три завжди потрібні інтерфейсу:
 * дані, ознаку завантаження і помилку.
 *
 * @param {string | null} path шлях запиту; null означає «не запитувати нічого»
 * @returns {{ data: unknown, isLoading: boolean, error: Error | null }}
 */
export function useTmdb(path) {
  const [data, setData] = useState(null);
  /*
    Початкове значення — true, якщо шлях є, і це не дрібниця.

    useEffect запускається ПІСЛЯ першого малювання. Якби isLoading починався
    з false, перший кадр показав би стан «даних немає» — на головній це
    повідомлення «Тут поки порожньо», яке блимало б перед кожним списком.
    Запит справді вже в дорозі на момент першого малювання, тож і стан
    від самого початку має бути «завантажуємо».
  */
  const [isLoading, setIsLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      // Запиту не буде — прибираємо і дані, і сліди попереднього запиту.
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    /*
      AbortController дозволяє скасувати запит, який більше не потрібен.
      Без нього виходить ось що: користувач швидко друкує «бет», летять три
      запити — «б», «бе», «бет» — і повертаються вони в довільному порядку.
      Якщо відповідь на «бе» прийде останньою, на екрані опиняться
      результати для «бе», хоча в полі написано «бет».
    */
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    tmdbFetch(path, controller.signal)
      .then((result) => setData(result))
      .catch((requestError) => {
        /*
          Скасований запит теж потрапляє в catch — але це не помилка,
          а наше власне рішення. Показувати її користувачеві не можна.
        */
        if (requestError.name === "AbortError") return;
        setError(requestError);
      })
      .finally(() => {
        // Після скасування стан чіпати не можна: цим ефектом уже ніхто не володіє.
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    /*
      Функція очищення. React викликає її перед наступним запуском ефекту
      і коли компонент зникає з екрана. Це те саме місце, де прибирають
      таймери й підписки.
    */
    return () => controller.abort();
  }, [path]); // ефект перезапускається лише коли змінився шлях запиту

  return { data, isLoading, error };
}

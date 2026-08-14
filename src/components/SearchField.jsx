import { SearchIcon } from "./icons.jsx";

/**
 * Поле пошуку з макета: іконка ліворуч, поле без кнопки.
 *
 * Компонент керований: значення й обробник приходять згори. Власного стану
 * він не має навмисно — той самий текст потрібен і полю, і запиту,
 * тому живе він у спільного батька (HomePage). Це і є «підняти стан».
 *
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export default function SearchField({ value, onChange }) {
  return (
    <div className="search">
      <SearchIcon />

      {/*
        <label> обов'язковий, але за макетом його не видно: роль підпису
        виконує placeholder. Клас visually-hidden ховає текст від ока
        й лишає його читалці з екрана. display: none так не працює —
        він ховає елемент і від читалки теж.
      */}
      <label className="visually-hidden" htmlFor="media-search">
        Пошук фільмів і серіалів
      </label>

      <input
        id="media-search"
        className="search__input"
        type="search"
        placeholder="Пошук фільмів і серіалів"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

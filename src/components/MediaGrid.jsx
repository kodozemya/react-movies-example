import MediaCard from "./MediaCard.jsx";

/**
 * Сітка карток.
 *
 * @param {{ items: object[] }} props
 */
export default function MediaGrid({ items }) {
  return (
    <ul className="grid">
      {items.map((item) => (
        /*
          key — це не «щоб не було попередження в консолі». Це відповідь
          на питання «чи той самий це елемент, що був тут раніше».

          Ключ склеєний із типу й id, бо фільм і серіал можуть мати однаковий
          id — вони лежать у різних таблицях TMDB. З key={item.id} два таких
          записи в одному списку дали б дублікат ключа.

          З key={index} React вважав би, що перша картка лишилася першою,
          і залишив би в ній старий стан після пошуку.
        */
        <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
      ))}
    </ul>
  );
}

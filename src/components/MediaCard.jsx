import { Link } from "react-router-dom";

import { posterUrl } from "../api/tmdb.js";
import { StarIcon } from "./icons.jsx";

/**
 * Картка з макета: постер, оцінка в куті, назва під ним.
 *
 * @param {{ item: object }} props запис, уже приведений normalizeMedia
 */
export default function MediaCard({ item }) {
  const poster = posterUrl(item.posterPath);

  // vote_average приходить як 7.834 — на картці потрібна одна цифра після коми.
  const rating = item.rating > 0 ? item.rating.toFixed(1) : null;

  return (
    <li className="card">
      <Link className="card__link" to={`/title/${item.mediaType}/${item.id}`}>
        <div className="card__poster">
          {poster ? (
            /*
              loading="lazy" каже браузеру не вантажити постери, до яких
              користувач ще не долистав. На сторінці з двадцятьма картками
              це різниця між двома мегабайтами й двадцятьма.
            */
            <img src={poster} alt={`Постер: ${item.title}`} loading="lazy" />
          ) : (
            /*
              poster_path у TMDB часто дорівнює null. Без цієї гілки
              на місці постера був би зламаний значок зображення.
            */
            <p className="card__poster-empty">Постера немає</p>
          )}

          {rating && (
            <p className="rating card__rating">
              <StarIcon />
              <span className="visually-hidden">Оцінка</span>
              {rating}
            </p>
          )}
        </div>

        <h3 className="card__title">{item.title}</h3>
      </Link>
    </li>
  );
}

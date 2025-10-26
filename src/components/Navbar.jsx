import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [favCount, setFavCount] = useState(0); // numero di preferiti salvati
  useEffect(() => {
    function updateFav() {
      const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // converto stringha salvata in array e recupero lista preferiti/array vuoto
      // Filtra id non validi: null, undefined, stringa vuota, NaN
      const validFav = fav.filter(id => id !== null && id !== undefined && id !== "" && !Number.isNaN(id));
      setFavCount(validFav.length); // aggiorno la lunghezza dei preferiti validi
    }
    updateFav(); // aggiorno il conteggio dei preferiti al montaggio del componente
    window.addEventListener("storage", updateFav); // ascolto evento storage che si attiva quando aggiorno localStorage da altre pagine
    return () => window.removeEventListener("storage", updateFav); // pulisco l'evento allo smontaggio del componente
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink className="navbar-brand" aria-current="page" to="/">
          Laptop store
        </NavLink>
        <div className="navbar-links">
          <ul className="navbar-list">
            <li>
              <NavLink className="navbar-link relative" to="/preferiti" title="Preferiti">
                <span className="fav-btn fav-btn-1" role="img" aria-label="preferiti">
                  ❤️
                  {favCount > 0 && (
                    <span className="fav-count">
                      {favCount}
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
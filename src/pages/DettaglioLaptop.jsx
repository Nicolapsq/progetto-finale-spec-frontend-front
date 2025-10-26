import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function DettaglioLaptop() {
  const { id } = useParams(); // recupero parametro "id" dall'URL
  if (!id) {
    return (
      <div style={{ color: "red", margin: "2rem" }}>
        Errore: ID non fornito nell'URL. Impossibile caricare il dettaglio.
      </div>
    );
  }
  const [laptop, setLaptop] = useState(null); // laptop nel dettaglio
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false); // se laptop è nei preferiti
  // Controlla se il laptop è nei preferiti
  useEffect(() => {
    if (!laptop) return; // se laptop non ce'è non fare nulla
    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // leggo preferiti da localStorage\array vuoto
    setIsFav(fav.includes(laptop.id)); // aggiorno stato
  }, [laptop]);

  function toggleFav() {
    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // leggo preferiti da localStorage\array vuoto
    let newFav;
    if (fav.includes(laptop.id)) { // se è nei preferiti
      newFav = fav.filter((x) => x !== laptop.id); // lo rimuovo
    } else {
      newFav = [...fav, laptop.id]; // altrimenti lo aggiungo
    }
    localStorage.setItem("preferiti", JSON.stringify(newFav)); // salvo array aggiornato su localStorage
    setIsFav(newFav.includes(laptop.id)); // aggiorno stato
    // Forza aggiornamento Navbar anche nella stessa tab
    window.dispatchEvent(new Event("storage")); // forza aggiornamento navbar
  }

  useEffect(() => {
    console.log("ID richiesto per dettaglio:", id);
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/laptops/${id}`) // faccio richiesta al server per dettaglio laptop
      .then((res) => {
        if (!res.ok) throw new Error("Laptop non trovato"); // se risposta non ok lancio errore
        return (
          res.json()
        ).then((data) => {
          console.log("Dati ricevuti per dettaglio:", data.laptop);
          setLaptop(data.laptop);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="error-wrapper">
        <div className="loading-box">
          <h2>Caricamento...</h2>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="error-wrapper">
        <div className="error-box">
          <h2>Errore: {error}</h2>
        </div>
      </div>
    );
  <div style={{ color: "red" }}>Errore: {error}</div>;
  if (!laptop)
    return (
      <div className="error-wrapper">
        <div className="error-box">
          <h2>Laptop non trovato</h2>
        </div>
      </div>
    );

  return (
    <div className="detail-center">
      <div className="detail-card">
        <div className="detail-image">
          {laptop.image && (
            <img
              className="detail-image"
              src={laptop.image}
              alt={laptop.title}
            />
          )}
        </div>
        <div className="detail-info">
          <h2 className="detail-title">{laptop.title}</h2>
          <div className="detail-category">
            <strong>Categoria:</strong> {laptop.category}
          </div>
          {laptop.brand && (
            <div>
              <strong>Marca:</strong> {laptop.brand}
            </div>
          )}
          {laptop.price !== undefined && laptop.price !== null && (
            <div>
              <strong>Prezzo:</strong> {laptop.price}€
            </div>
          )}
          {laptop.releaseYear && (
            <div>
              <strong>Anno:</strong> {laptop.releaseYear}
            </div>
          )}
          {laptop.cpu && (
            <div>
              <strong>CPU:</strong> {laptop.cpu}
            </div>
          )}
          {laptop.ram && (
            <div>
              <strong>RAM:</strong> {laptop.ram}
            </div>
          )}
          {laptop.storage && (
            <div>
              <strong>Storage:</strong> {laptop.storage}
            </div>
          )}
          <button
            onClick={toggleFav}
            className={isFav ? "fav-btn fav-btn-active" : "fav-btn"}
            style={{
              background: isFav
                ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)",
              color: isFav ? "#232946" : "#232946",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isFav
                ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)";
              e.currentTarget.style.color = isFav ? "#232946" : "#232946";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isFav
                ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)";
              e.currentTarget.style.color = isFav ? "#232946" : "#232946";
            }}
          >
            {isFav ? "💔 Rimuovi dai preferiti" : "❤️ Aggiungi ai preferiti"}
          </button>
          <Link to="/" className="detail-back">
            Torna alla lista
          </Link>
          <Link to="/preferiti" className="detail-back">
            Vai a Preferiti
          </Link>
        </div>
      </div>
    </div>
  );
}

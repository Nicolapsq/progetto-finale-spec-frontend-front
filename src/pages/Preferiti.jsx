import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Preferiti() {
  const [preferiti, setPreferiti] = useState([]); // array di laptop preferiti presi da localStorage
  const [laptops, setLaptops] = useState([]); // array di laptop ottenuti dal backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchPreferiti = async () => { // funzione asincrona
    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]").filter( // leggo preferiti da localStorage\array vuoto e filtro id non validi
      (id) => !!id
    );
    console.log("ID preferiti:", fav);

    setPreferiti(fav); // aggiorno stato preferiti

    if (fav.length === 0) {
      setLaptops([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Richieste in parallelo
      const responses = await Promise.all( // aspetto tutte le fetch
        fav.map((id) => fetch(`${API_URL}/laptops/${id}`))
      );

      // Se una risposta non è ok, genero l'errore
      responses.forEach((res) => {
        if (!res.ok) throw new Error("Laptop non trovato");
      });

      // Converto tutte le risposte in JSON
      const data = await Promise.all(responses.map((res) => res.json()));

      console.log("Dati ricevuti per preferiti:", data.map((item) => item.laptop));

      setLaptops(data.map((item) => item.laptop)); // aggiorno stato laptops
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchPreferiti();
}, []);


  if (loading) return <div>Caricamento...</div>;
  if (error) return <div style={{ color: "red" }}>Errore: {error}</div>;
  if (preferiti.length === 0 || laptops.length === 0)
    return (
      <>
        <div className="empty-state">
          Non hai nessun prodotto preferito
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "2.5rem",
          }}
        >
          <Link to="/" className="detail-back">
            Torna alla lista
          </Link>
        </div>
      </>
    );

  // Funzione per rimuovere un laptop dai preferiti
  function removeFromFav(id) {
    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // leggo preferiti da localStorage\array vuoto
    const newFav = fav.filter((favId) => favId !== id); // filtro id da rimuovere
    localStorage.setItem("preferiti", JSON.stringify(newFav)); // aggiorno array su localStorage
    setPreferiti(newFav); // aggiorno stato preferiti
    setLaptops(laptops.filter((l) => l.id !== id)); // aggiorno stato laptops
    // Forza aggiornamento Navbar
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Laptop preferiti
        </h1>
      </div>
      <div className="cards-list">
        {laptops.map((l) => (
          <div key={l.id} className="laptop-card">
            {l.image && (
              <img src={l.image} alt={l.title} className="laptop-img" />
            )}
            <h3 className="laptop-title">{l.title}</h3>
            <div className="laptop-brand">{l.brand}</div>
            <Link
              to={`/laptops/${l.id}`}
              className="detail-back"
              style={{ marginTop: "1rem" }}
            >
              Vai alla pagina
            </Link>
            <button
              onClick={() => removeFromFav(l.id)}
              className="btn-primary"
              style={{
                marginTop: "0.7rem",
                background: "#e63946",
                color: "#fff",
              }}
            >
              Rimuovi dai preferiti
            </button>
          </div>
        ))}
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <Link
          to="/"
          className="detail-back"
          style={{ marginTop: "2rem", display: "inline-block" }}
        >
          Torna alla lista
        </Link>
      </div>
    </div>
  );
}

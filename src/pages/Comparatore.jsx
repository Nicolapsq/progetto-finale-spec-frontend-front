import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"; // variabile di ambiente per URL API backend

export default function Comparatore() {  // pagina di confronto tra 2 laptop
  const [searchParams, setSearchParams] = useSearchParams();
  const [laptops, setLaptops] = useState([]); // array di laptop da confrontare
  const [isFavs, setIsFavs] = useState([]); // array di booleani per preferiti
  const [loading, setLoading] = useState(true); // stato di caricamento
  const [error, setError] = useState(null); // stato di errore


  useEffect(() => {
  const fetchLaptops = async () => { // funzione asincrona per fetch dei laptop
    const ids = searchParams.getAll("id"); // recupero tutti i parametri "id" dalla query string
    if (ids.length !== 2) { // se non sono esattamente 2 id
      setLaptops([]); // svuoto lista laptop
      setLoading(false); // imposto caricamento a falso
      return; // esco dalla funzione
    }

    try {
      setLoading(true); // imposto caricamento caricamento
      setError(null); // resetto errore

      // Effettua tutte le richieste in parallelo
      const responses = await Promise.all(
        ids.map((id) => fetch(`${API_URL}/laptops/${id}`)) // mappa ogni id in una fetch
      );

      // Controlla se una delle risposte è fallita
      responses.forEach((res) => {
        if (!res.ok) {
          throw new Error("Laptop non trovato");
        }
      });

      // Converto in JSON tutte le risposte
      const data = await Promise.all(responses.map((res) => res.json()));

      // Mappo i dati JSON per ottenere gli oggetti laptop
      const laptopsData = data.map((item) => item.laptop);
      console.log("Dati ricevuti da comparare:", laptopsData);

      setLaptops(laptopsData); // aggiorno lo stato dei laptop

      // Aggiorna i preferiti
      const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // leggo preferiti da localStorage\array vuoto
      setIsFavs(laptopsData.map((l) => fav.includes(l.id))); // creo array booleani per preferiti e aggiorno lo stato
    } catch (err) { // catturo errori
      setError(err.message); // imposto messaggio di errore
    } finally {
      setLoading(false);
    }
  };

  fetchLaptops(); // invoco la funzione
}, [searchParams]);


  // Funzione per aggiungere/rimuovere preferiti per ogni laptop
  function toggleFav(idx) {
    const laptop = laptops[idx]; // laptop corrente
    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // leggo preferiti da localStorage\array vuoto
    let newFav;
    if (fav.includes(laptop.id)) { // se è già nei preferiti
      newFav = fav.filter((x) => x !== laptop.id); // lo rimuovo
    } else {
      newFav = [...fav, laptop.id]; // altrimenti lo aggiungo
    }
    localStorage.setItem("preferiti", JSON.stringify(newFav)); // salvo array aggiornato su localStorage
    // Aggiorna stato locale
    setIsFavs((isFavs) => {
      const arr = [...isFavs]; // creo copia dell'array
      arr[idx] = newFav.includes(laptop.id); // controllo se il laptop è ora nei preferiti
      return arr; // ritorno il nuovo array
    });
    // Forza aggiornamento Navbar anche nella stessa tab
    window.dispatchEvent(new Event("storage"));
  }

  const ids = searchParams.getAll("id"); // recupero tutti i parametri "id" dalla query string
  if (ids.length !== 2) // se non sono 2 id
    return (
      <>
        <div className="empty-state">
          <span role="img" aria-label="empty">
            🛒
          </span>
          Non hai nessun prodotto da confrontare
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

  return (
    <div>
      <div className="compare-list">
        {laptops.map((l, idx) => (
          <div key={l.id} className="compare-card">
            {l.image && (
              <img className="compare-image" src={l.image} alt={l.title} />
            )}
            <h3 className="compare-title">{l.title}</h3>
            <div className="compare-category">
              <strong>Categoria:</strong> {l.category}
            </div>
            <div>
              <strong>Marca:</strong> {l.brand}
            </div>
            <div>
              <strong>Prezzo:</strong> {l.price}€
            </div>
            <div>
              <strong>Anno:</strong> {l.releaseYear}
            </div>
            <div>
              <strong>CPU:</strong> {l.cpu}
            </div>
            <div>
              <strong>RAM:</strong> {l.ram}
            </div>
            <div>
              <strong>Storage:</strong> {l.storage}
            </div>
            <button
              onClick={() => toggleFav(idx)}
              className={isFavs[idx] ? "fav-btn fav-btn-active" : "fav-btn"}
              style={{
                background: isFavs[idx]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)",
                color: isFavs[idx] ? "#232946" : "#232946",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isFavs[idx]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)";
                e.currentTarget.style.color = isFavs[idx]
                  ? "#232946"
                  : "#232946";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isFavs[idx]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)";
                e.currentTarget.style.color = isFavs[idx]
                  ? "#232946"
                  : "#232946";
              }}
            >
              {isFavs[idx]
                ? "💔 Rimuovi dai preferiti"
                : "❤️ Aggiungi ai preferiti"}
            </button>
            <Link to="/preferiti" className="detail-back">
              Vai a Preferiti
            </Link>

            <Link to={`/laptops/${l?.id}`} className="compare-link">
              Vai alla pagina
            </Link>
          </div>
        ))}
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <Link to="/" className="compare-link">
          Torna alla lista
        </Link>
      </div>
    </div>
  );
}

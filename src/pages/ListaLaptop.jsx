import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // debounce per ricerca
    function debounce(callback, delay) {
      let timeout; // variabile per memorizzare il timeout (inizialmente undefined)
      return (value) => { // ritorna una funzione che prende un valore (closure)
        clearTimeout(timeout); // cancella il timeout precedente
        timeout = setTimeout(() => { // imposta un nuovo timeout
          callback(value); // esegue la funzione dopo il delay
        }, delay); // delay in millisecondi
      };
    };

export default function ListaRecord() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // per leggere e aggiornare i query params nell'URL
  const [laptops, setLaptops] = useState([]); // lista completa dei laptop
  const [compare, setCompare] = useState([]); // array di id scelti per confronto
  const [loading, setLoading] = useState(true); // gestione stato di caricamento
  const [error, setError] = useState(null); // gestione stato di errore
  const [isFavs, setIsFavs] = useState({}); // oggetto per laptop preferiti
  // const [laptop, setLaptop] = useState(null);

  // Lettura dei parametri di ricerca dall'URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const order = searchParams.get("order") || "az";

  // Stato locale per input ricerca
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search); // sincronizza se cambia searchParams da altre pagine
  }, [search]);

  // uso debounce per ricerca
    const debounceSearch = useCallback( // memoizza la funzione tra i render
      debounce((value) => { // funzione debounce che aggiorna query string
        setSearchParams({ search: value, category, order }); // aggiorno il valore in search
      }, 500), // 500ms di delay
      [category, order, setSearchParams] // dipendenze della funzione
    );

  useEffect(() => {
    setLoading(true); // inizio caricamento
    setError(null); // reset errore
    fetch(`${API_URL}/laptops`) // richiedo lista laptop
      .then((res) => { // restituisce promessa response
        if (!res.ok) throw new Error("Errore nel caricamento dati"); // stato response non ok lancia errore
        return res.json(); // promessa con dati in formato JSON
      })
      .then((data) => { // dati ricevuti dal server
        console.log("Dati ricevuti:", data);
        setLaptops(data); // aggiorno stato laptops
        setLoading(false); // fine caricamento
      })
      .catch((err) => { // gestione errore
        setError(err.message); // imposto messaggio di errore
        setLoading(false); // fine caricamento
      });
  }, []);

  // Categorie distinte
  // creo un array di categorie uniche dai laptop
  const categories = Array.from(new Set(laptops.map((l) => l.category)));

  // Filtro e ordinamento
  let filtered = laptops.filter( // creo array di laptop che soddisfano le condizioni di ricerca
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) && // filtro per ricerca titolo (search sottostringa di title)
      (category ? l.category === category : true) // filtro per categoria se selezionata
  );
  if (order === "az")
    filtered = filtered.sort((a, b) => a.title.localeCompare(b.title)); // ordino da A-Z
  if (order === "za")
    filtered = filtered.sort((a, b) => b.title.localeCompare(a.title)); // ordino da Z-A

  // Gestione form

  // aggiorno stato ricerca al cambiamento input (gestione input controllato con debounce)
  function handleSearch(e) {
    setSearchInput(e.target.value);
    debounceSearch(e.target.value);
  }

  // aggiorno query string

  function handleCategory(e) {
    setSearchParams({ search, category: e.target.value, order }); // aggiorno il valore in category
  }
  function handleOrder(e) {
    setSearchParams({ search, category, order: e.target.value }); // aggiorno il valore in order
  }

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
      <h2>Errore</h2>
      <p>{error}</p>
    </div>
  </div>
);
  //selezione per confronto
  function handleCompareChange(id) {
    setCompare((prev) => // aggiungo o rimuovo id dall'array di confronto
      prev.includes(id) // se id è già presente lo rimuovo
        ? prev.filter((x) => x !== id) // altrimenti lo aggiungo se ci sono meno di 2 selezionati
        : prev.length < 2
        ? [...prev, id]
        : prev
    );
  }
  // Avvio pagina di confronto
  function goToCompare() {
    if (compare.length === 2) { // se ci sono 2 id selezionati
      navigate(`/compare?id=${compare[0]}&id=${compare[1]}`); // navigo alla pagina di confronto con i 2 id come query params
    }
  }

  // Funzione per aggiungere/rimuovere preferiti per ogni laptop
  function toggleFav(id) {
    const laptop = laptops.find((l) => l.id === id); // trovo il laptop corrispondente all'id
    if (!laptop) {
      console.log("Laptop non trovato per id:", id);
      return; // se non trovato interrompo l'esecuzione
    }

    const fav = JSON.parse(localStorage.getItem("preferiti") || "[]"); // recupero lista preferiti/array vuoto
    let newFav;

    if (fav.includes(laptop.id)) { // se è già presente
      newFav = fav.filter((x) => x !== laptop.id); // lo rimuovo
    } else {
      newFav = [...fav, laptop.id]; // altrimenti lo aggiungo
    }

    localStorage.setItem("preferiti", JSON.stringify(newFav)); // salvo i dati aggiornati in stringa nel localStorage

    // Aggiorna stato locale
    setIsFavs((prev) => ({
      ...prev, // mantengo stato precedente
      [id]: newFav.includes(laptop.id), // aggiorno per id
    }));

    // Forza aggiornamento Navbar
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <h2>Lista Laptop</h2>
      </div>
      <div
        className="filters-bar"
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <input
          type="text"
          placeholder="Cerca..."
          value={searchInput}
          onChange={handleSearch}
        />
        <select
          value={category}
          onChange={handleCategory}
        >
          <option value="">Tutte le categorie</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={order}
          onChange={handleOrder}
        >
          <option value="az">Ordina A-Z</option>
          <option value="za">Ordina Z-A</option>
        </select>
      </div>
      <div className="cards-list mt-8">
        {filtered.map((l) => (
          <div key={l.id} className="laptop-card relative">
            <span className="checkBoxCompare">
              <input
                type="checkbox"
                checked={compare.includes(l.id)}
                onChange={() => handleCompareChange(l.id)}
                disabled={compare.length === 2 && !compare.includes(l.id)}
                className="absolute top-2 left-2 accent-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400 compare-checkbox"
                title="Seleziona per confronto"
                style={{ width: "1.2rem", height: "1.2rem" }}
              />
              <span> Confronta</span>
            </span>
            <Link to={`/laptops/${l.id}`} className="block w-full">
              {l.image && (
                <img src={l.image} alt={l.title} className="laptop-img" />
              )}
              <div className="laptop-title-wrapper">
              <h3 className="laptop-title">{l.title}</h3>
              </div>
              <div className="laptop-brand">{l.brand}</div>
              <h4 className="laptop-category">{l.category}</h4>
            </Link>

            <button
              onClick={() => toggleFav(l.id)}
              className={isFavs[l.id] ? "fav-btn fav-btn-active" : "fav-btn"}
              style={{
                background: isFavs[l.id]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)",
                color: isFavs[l.id] ? "##232946" : "#232946",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = isFavs[l.id]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #b8c1ec 60%, #eebbc3 100%)";
                e.currentTarget.style.color = isFavs[l.id]
                  ? "##232946"
                  : "#232946";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = isFavs[l.id]
                  ? "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)"
                  : "linear-gradient(90deg, #eebbc3 60%, #b8c1ec 100%)";
                e.currentTarget.style.color = isFavs[l.id]
                  ? "##232946"
                  : "#232946";
              }}
            >
              {isFavs[l.id]
                ? "💔 Rimuovi dai preferiti"
                : "❤️ Aggiungi ai preferiti"}
            </button>

            <Link to="/preferiti" className="detail-back">
              Vai a Preferiti
            </Link>
          </div>
        ))}
      </div>
      {compare.length === 2 && (
        <button
          className="btn-compare"
          onClick={goToCompare}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#232946";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#eebbc3";
            e.currentTarget.style.color = "#232946";
          }}
        >
          Confronta selezionati
        </button>
      )}
      {filtered.length === 0 && (
        <div
        style={{ display: "flex", justifyContent: "center", margin: "2.5rem" }}
      >
        <h2>Nessun risultato trovato</h2>
      </div>
      )}
    </div>
  );
}
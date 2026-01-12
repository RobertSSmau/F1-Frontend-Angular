# F1 Management System - Requisiti Frontend (Angular 21)

Documento di specifica per lo sviluppo del frontend gestionale integrato con backend .NET e Keycloak.

---

## Stack Tecnologico
- **Framework:** Angular 21 (Standalone Components)
- **Backend:** API .NET 
- **UI & Styles:** Angular Material
- **Forms:** Reactive Forms (Model-driven)
- **Security:** Nebular Security (@nebular/security) per gestione JWT e sessioni
- **Identity Provider:** Keycloak (Realm: f1-management)

---

## Sicurezza e Autorizzazioni
L'accesso è regolato da Keycloak con due livelli di permessi:

| Ruolo | Permessi |
| :--- | :--- |
| **Guest** | Sola lettura: GET (lista) e GET (by ID) |
| **Admin** | Accesso completo: GET, POST, PUT, DELETE |

- **Autenticazione:** Pagina di login dedicata.
- **Sessioni:** Gestione token JWT tramite Nebular Security.

---

### Topbar (Striscia Rossa)
- **Sinistra:** Hamburger menu bianco per apertura/chiusura Sidebar.
- **Centro:** Spazio riservato per il logo ufficiale Formula 1.
- **Destra:** - Pulsante Logout.
    - Placeholder icona Avatar (cerchio).

### Sidebar (Menu a comparsa)
Link di navigazione rapida per le entità principali:
- Championships
- Teams
- Drivers
- Cars

---

## Gestione Tabelle e Dati
Tutte le tabelle seguono uno standard comune:

### Funzionalità Core
-**Pagina da utente non loggato** - L'utente se non ha effettuto la login vedrà solo la pagina di login. Se prova ad accedere a una rotta protetta , verrà reindirizzato al login
    ma con un messaggio di avviso "Non puoi accedere a questa pagina se non hai effettuato il login".
- **Default View:** La pagina iniziale dopo il login è la tabella Championships, ordinata per anno decrescente.
- **Paginazione:** - Dropdown per selezione elementi per pagina (Max 20).
    - Frecce di navigazione (Avanti/Indietro).
- **Colonna Actions:** Contiene icone per ogni riga (disponibile se l'utente è ruolo admin , altrimenti saranno non cliccabili(grigie)):
    - **Matita (Edit):** Apre un modulo Reactive Form precompilato con i dati esistenti (patchValue).
    - **Cestino (Delete):** Avvia la procedura di cancellazione.
- **Modali:** Ogni azione (Salvataggio/Cancellazione) richiede una conferma tramite modale di sicurezza.

### Flusso Gerarchico (Drill-down)
Il sistema gestisce la navigazione filtrata tra le entità:
1. **Championship** -> Cliccando una riga, mostra i Teams filtrati per ChampionshipId.
2. **Team** -> Cliccando una riga, mostra i Drivers filtrati per TeamId e ChampionshipId.
3. **Driver** -> Cliccando una riga, mostra la Car associata (se presente).
# Offsure

A static company website for **Offsure**, a global logistics company, with a built-in goods tracking page. Built with plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Features

- Hero with a quick tracking form
- Full tracking section: status badge, progress bar, shipment details and event timeline
- Services, About, How it works, FAQ and Contact sections
- Dark theme with orange accents, fully responsive, mobile menu
- Accessible markup (labels, ARIA attributes, reduced-motion support)

## Project structure

```
offsure/
├── index.html      # Page markup
├── css/
│   └── style.css   # All styling
├── js/
│   └── main.js     # Tracking logic, menu, counters, contact form
└── README.md
```

## Run it

Open `index.html` in any browser, or serve the folder locally:

```bash
cd offsure
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Try the tracking

Demo tracking numbers (defined in `js/main.js`):

| Number         | Status       |
| -------------- | ------------ |
| `OFS123456789` | In transit   |
| `OFS555000111` | Delivered    |
| `OFS987654321` | Customs hold |

Tracking numbers use the format `OFS` followed by 9 digits.

## Connect a real tracking backend

The shipments in `js/main.js` are sample data. To use live data, replace the body of `fetchShipment(number)` with a request to your API:

```js
function fetchShipment(number) {
  return fetch("/api/track/" + encodeURIComponent(number))
    .then(function (res) {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    });
}
```

The API should return JSON in this shape (or `null`/404 when not found):

```json
{
  "status": "In transit",
  "origin": "Shanghai, China",
  "destination": "Lagos, Nigeria",
  "service": "Sea freight (FCL)",
  "weight": "1,240 kg",
  "eta": "2026-11-02",
  "stage": 2,
  "exception": false,
  "history": [
    { "when": "2026-10-17 09:40", "where": "Port of Tema", "text": "Arrived at port" }
  ]
}
```

`stage` is a number from 0 to 4: Booked, Picked up, In transit, Customs, Delivered. The `history` list is newest first.

## Customise

- **Contact details:** edit the Contact section in `index.html` (they are placeholders).
- **Colours:** change the variables at the top of `css/style.css` (`--orange` is the main accent).
- **Contact form:** currently front-end only. Connect it to a service such as Formspree, or your own endpoint, to send messages.

## Deploy

Upload the folder to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## License

Free to use and modify for the Offsure project.

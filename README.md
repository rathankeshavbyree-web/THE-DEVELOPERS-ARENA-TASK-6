# ATMOSPHERE - Premium Weather Dashboard

A world-class, production-ready weather dashboard web application featuring cinematic atmospheric animations, premium glassmorphism design, and real-time weather data from Visual Crossing Weather API.

[![Weather Dashboard](https://img.shields.io/badge/Weather-Dashboard-blue)](https://github.com) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Features

- **Real-time Weather Data**: Fetches live weather data from Visual Crossing Weather API
- **Current Weather Display**: Temperature, feels like, humidity, wind, pressure, visibility, sunrise/sunset
- **Hourly Forecast**: 8-hour forecast with precipitation probability
- **5-Day Forecast**: Daily weather summary with min/max temperatures
- **Detailed Metrics Grid**: Comprehensive weather information in beautiful cards
- **Dynamic Atmospheric Backgrounds**: Cinematic animations that change based on weather conditions
- **Premium Glassmorphism Design**: Frosted translucent cards with soft shadows
- **Favorites System**: Save up to 10 favorite cities for quick access
- **Search History**: Tracks your last 5 searched cities
- **Temperature Units**: Switch between Celsius (°C) and Fahrenheit (°F)
- **Local Storage Persistence**: Saves your preferences and data locally
- **Fully Responsive**: Optimized for all devices from phones to ultra-wide monitors
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Loading States**: Elegant animated loading overlay
- **Error Handling**: Graceful error messages with retry functionality

## Atmospheric Backgrounds

The application features realistic animated backgrounds that adapt to weather conditions:

- **Clear Sky**: Glowing sun with warm light rays and lens flare
- **Cloudy**: Multi-layer drifting clouds with parallax motion
- **Rain**: Falling raindrops with ripple overlays
- **Thunderstorm**: Lightning flashes with dark storm atmosphere
- **Snow**: Falling snowflakes with layered depth
- **Fog/Mist**: Slow translucent fog layers
- **Night**: Moon glow with twinkling stars

## Project Structure

```
weather-dashboard/
│
├── index.html          # Main HTML structure
├── README.md           # Project documentation
│
├── css/
│   └── styles.css      # All styling with glassmorphism design
│
└── js/
    ├── app.js          # Main application logic
    ├── api.js          # Visual Crossing Weather API integration
    └── storage.js      # Local storage utilities
```

## Live Demo

[View Live Demo]https://the-developers-arena-task-6.vercel.app/

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Edge, Firefox, Safari)
- A Visual Crossing Weather API key (free, no credit card required)

### API Key Setup

1. Sign up for a free account at [Visual Crossing Weather](https://www.visualcrossing.com/weather-api)
2. No credit card required for the free tier
3. Navigate to the API keys section in your dashboard
4. Copy your API key
5. Open `js/api.js` in a text editor
6. Replace `YOUR_VISUAL_CROSSING_API_KEY` with your actual API key:

```javascript
const API_KEY = "your_visual_crossing_api_key_here";
```

### Running the Application

Simply open `index.html` in your web browser. No build tools, package managers, or server required!

```bash
# Option 1: Double-click index.html
# Option 2: Drag and drop index.html into your browser
# Option 3: Use a local server (optional)
python -m http.server 8000
# Then visit http://localhost:8000
```

## Design Features

### Glassmorphism Design
- Frosted translucent cards with backdrop blur
- Soft shadows and smooth gradients
- Large border radii (24px+) for modern aesthetic
- Elegant typography using Inter and system fonts

### Micro-interactions
- Hover lift effects on cards
- Button ripple animations
- Fade-in and slide-up transitions
- Number transitions for smooth updates

### Responsive Design
- Mobile-first architecture
- Fluid typography using `clamp()`
- Flexible CSS Grid and Flexbox layouts
- Breakpoints: 320px, 480px, 768px, 1024px, 1440px, 1920px+
- Touch-friendly controls (minimum 44px targets)
- Sticky header on mobile and desktop
- Horizontal forecast scrolling on smaller screens

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Styling, animations, and responsive design
- **Vanilla JavaScript (ES6+)**: Application logic and API integration
- **Visual Crossing Weather API**: Weather data provider
- **Local Storage**: Data persistence

No frameworks, libraries, or build tools required!

## Accessibility

- Semantic HTML5 structure
- Proper heading hierarchy
- ARIA labels and roles
- Keyboard navigation support
- Focus-visible states
- Sufficient color contrast
- Screen-reader friendly labels
- Reduced-motion support for users who prefer it

## API Integration

The application uses the Visual Crossing Weather API Timeline endpoint:

**API Endpoint**: 
```
https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{CITY}?unitGroup=metric&include=current,hours,days&key={API_KEY}&contentType=json
```

This single endpoint returns:
- Current weather conditions
- Hourly forecast (24 hours)
- Daily forecast (5 days)

All API calls include:
- Async/await for clean asynchronous code
- Try/catch error handling
- Response validation
- Timeout handling with AbortController
- Network error detection

## Local Storage

The application persists the following data:

- `weather_last_city`: Last searched city
- `weather_units`: Temperature unit preference (metric/imperial)
- `weather_theme`: Theme preference
- `weather_favorites`: List of favorite cities (max 10)
- `weather_search_history`: Recent search history (last 5)

## Browser Support

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Device Support

Perfectly responsive and optimized for:
- Small phones (320px+)
- Standard phones
- Large phones
- Tablets
- Laptops
- Desktops
- Ultra-wide monitors
- High-DPI displays

Supports both portrait and landscape orientations.

## Customization

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --glass-bg: rgba(255, 255, 255, 0.15);
    --accent: #ffd700;
    /* ... more variables */
}
```

### Modifying Animations

Animation durations and effects can be adjusted in the CSS:

```css
:root {
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

### Adding New Weather Conditions

Extend the `getWeatherCategory()` function in `js/api.js` to handle additional weather conditions.

## Troubleshooting

### API Key Issues
- Ensure your API key is valid and active
- Check that you've replaced `YOUR_VISUAL_CROSSING_API_KEY` in `js/api.js`
- Verify your API key has the necessary permissions

### City Not Found
- Check the spelling of the city name
- Try adding the country code (e.g., "London,UK" or "New York,US")
- Some smaller cities may not be in the Visual Crossing database

### Network Errors
- Check your internet connection
- Verify that Visual Crossing services are operational
- Try again after a few moments

### Styling Issues
- Clear your browser cache
- Ensure all CSS files are linked correctly
- Check browser console for CSS errors

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments for detailed explanations
3. Consult Visual Crossing Weather API documentation

## Future Enhancements

Potential features for future versions:
- Air quality index integration
- UV index display
- Weather alerts and warnings
- Radar maps
- Extended 14-day forecast
- Weather comparison between cities
- Dark/light theme toggle
- Weather widgets for other platforms
- Multi-language support

---

Built with pure HTML, CSS, and JavaScript.

**ATMOSPHERE** - Experience weather like never before.

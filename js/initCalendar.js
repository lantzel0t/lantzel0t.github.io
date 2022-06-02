// Refer to FullCalendar docs for more customization
// API key: AIzaSyA3uX2Qdh5m67ho8ELTdTtdwLENIZ_0SIM
// Address: autigerdev@gmail.com

// Initialize
var ratio = 2.5;
var view = 'dayGridMonth';

// Change ratio for mobile
if (window.screen.width <= 1000) {
  ratio = 0.75;
}

// Create calendar
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: view,
      aspectRatio: ratio,
      googleCalendarApiKey: 'AIzaSyA3uX2Qdh5m67ho8ELTdTtdwLENIZ_0SIM',
      eventSources: [
        {
          googleCalendarId: 'autigerdev@gmail.com'
        }, {
          googleCalendarId: 'en.usa#holiday@group.v.calendar.google.com'
        }
      ]
    });
  
    calendar.render();
  });
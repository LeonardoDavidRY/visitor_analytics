import personas from '@/data/registro_personas_biblioteca.json';

function filterByTime(startHour, endHour) {
  const hourly = {};
  console.log('Datos cargados:', personas);

  personas.forEach((p) => {
    if (!p.timestamp) return;
    const date = new Date(p.timestamp);
    const hour = date.getUTCHours();
    console.log('Registro:', { hour, startHour, endHour, timestamp: p.timestamp });
    if (hour < startHour || hour > endHour) return;

    if (!hourly[hour]) hourly[hour] = new Set();
    hourly[hour].add(p.id);
  });

  return Object.keys(hourly).map((hour) => ({
    hour: parseInt(hour),
    visitors: { total: hourly[hour].size },
  }));
}

export default {
  filterByTime,
};
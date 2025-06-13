// src/data/mockData.js

// Generar datos simulados para un día completo (6 AM - 10 PM)
const generateHourlyData = () => {
  const data = [];
  const zones = [
    'entrada_norte',
    'entrada_sur',
    'zona_juegos',
    'lago',
    'sendero_bosque',
    'cafeteria',
  ];
  const baseDate = new Date('2024-06-12');
  // Generar datos por hora
  for (let hour = 6; hour <= 22; hour++) {
    zones.forEach((zone) => {
      // Simular diferentes patrones de visitas según la hora
      let baseVisitors = 0;
      if (hour >= 7 && hour <= 9)
        baseVisitors = Math.floor(Math.random() * 15) + 5; // Mañana temprano
      else if (hour >= 10 && hour <= 12)
        baseVisitors = Math.floor(Math.random() * 25) + 15; // Media mañana
      else if (hour >= 13 && hour <= 15)
        baseVisitors = Math.floor(Math.random() * 35) + 20; // Tarde pico
      else if (hour >= 16 && hour <= 18)
        baseVisitors = Math.floor(Math.random() * 30) + 25; // Tarde
      else if (hour >= 19 && hour <= 21)
        baseVisitors = Math.floor(Math.random() * 20) + 10; // Noche
      else baseVisitors = Math.floor(Math.random() * 8) + 2; // Horas bajas

      const adults = Math.floor(baseVisitors * 0.6);
      const children = baseVisitors - adults;
      const male = Math.floor(baseVisitors * (0.4 + Math.random() * 0.2));
      const female = baseVisitors - male;

      data.push({
        id: `${zone}_${hour}`,
        timestamp: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          hour,
          0,
          0
        ).toISOString(),
        hour: hour,
        location: {
          zone: zone,
          zoneName: getZoneName(zone),
          coordinates: getZoneCoordinates(zone),
        },
        visitors: {
          total: baseVisitors,
          demographics: {
            adults: adults,
            children: children,
            male: male,
            female: female,
          },
        },
        activities: generateActivities(zone, hour),
        weather: getWeatherByHour(hour),
        temperature: getTemperatureByHour(hour),
      });
    });
  }

  return data;
};

// Nombres legibles para las zonas
const getZoneName = (zone) => {
  const names = {
    entrada_norte: 'Entrada Norte',
    entrada_sur: 'Entrada Sur',
    zona_juegos: 'Zona de Juegos',
    lago: 'Área del Lago',
    sendero_bosque: 'Sendero del Bosque',
    cafeteria: 'Cafetería',
  };
  return names[zone] || zone;
};

// Coordenadas simuladas para cada zona
const getZoneCoordinates = (zone) => {
  const coords = {
    entrada_norte: [-0.1807, -78.4678],
    entrada_sur: [-0.1817, -78.4688],
    zona_juegos: [-0.1812, -78.4683],
    lago: [-0.182, -78.4675],
    sendero_bosque: [-0.1825, -78.469],
    cafeteria: [-0.1815, -78.468],
  };
  return coords[zone] || [-0.1812, -78.4683];
};

// Actividades según zona y hora
const generateActivities = (zone) => {
  const activities = {
    entrada_norte: ['llegada', 'salida', 'orientación'],
    entrada_sur: ['llegada', 'salida'],
    zona_juegos: ['juego', 'descanso', 'socialización'],
    lago: ['contemplación', 'fotografía', 'alimentar_patos'],
    sendero_bosque: ['caminata', 'ejercicio', 'observación_naturaleza'],
    cafeteria: ['alimentación', 'descanso', 'socialización'],
  };

  const zoneActivities = activities[zone] || ['visita'];
  return zoneActivities[Math.floor(Math.random() * zoneActivities.length)];
};

// Clima simulado según hora
const getWeatherByHour = (hour) => {
  if (hour < 8) return 'fresco';
  if (hour < 12) return 'soleado';
  if (hour < 16) return 'soleado';
  if (hour < 19) return 'templado';
  return 'fresco';
};

// Temperatura simulada
const getTemperatureByHour = (hour) => {
  const baseTemp = 18; // Temperatura base para Quito
  if (hour < 8) return baseTemp + Math.random() * 3;
  if (hour < 12) return baseTemp + 3 + Math.random() * 4;
  if (hour < 16) return baseTemp + 5 + Math.random() * 3;
  if (hour < 19) return baseTemp + 2 + Math.random() * 3;
  return baseTemp + Math.random() * 2;
};

// Datos principales
export const visitorData = generateHourlyData();

// Datos agregados por zona
export const getDataByZone = () => {
  const zoneData = {};
  visitorData.forEach((record) => {
    if (!zoneData[record.location.zone]) {
      zoneData[record.location.zone] = {
        zone: record.location.zone,
        zoneName: record.location.zoneName,
        coordinates: record.location.coordinates,
        totalVisitors: 0,
        hourlyData: [],
        demographics: { adults: 0, children: 0, male: 0, female: 0 },
      };
    }

    zoneData[record.location.zone].totalVisitors += record.visitors.total;
    zoneData[record.location.zone].demographics.adults +=
      record.visitors.demographics.adults;
    zoneData[record.location.zone].demographics.children +=
      record.visitors.demographics.children;
    zoneData[record.location.zone].demographics.male +=
      record.visitors.demographics.male;
    zoneData[record.location.zone].demographics.female +=
      record.visitors.demographics.female;
    zoneData[record.location.zone].hourlyData.push({
      hour: record.hour,
      visitors: record.visitors.total,
    });
  });

  return Object.values(zoneData);
};

// Datos agregados por hora
export const getDataByHour = () => {
  const hourlyData = {};
  visitorData.forEach((record) => {
    if (!hourlyData[record.hour]) {
      hourlyData[record.hour] = {
        hour: record.hour,
        totalVisitors: 0,
        zones: [],
      };
    }

    hourlyData[record.hour].totalVisitors += record.visitors.total;
    hourlyData[record.hour].zones.push({
      zone: record.location.zoneName,
      visitors: record.visitors.total,
    });
  });

  return Object.values(hourlyData).sort((a, b) => a.hour - b.hour);
};

// Estadísticas generales
export const getOverallStats = () => {
  const totalVisitors = visitorData.reduce(
    (sum, record) => sum + record.visitors.total,
    0
  );
  const totalAdults = visitorData.reduce(
    (sum, record) => sum + record.visitors.demographics.adults,
    0
  );
  const totalChildren = visitorData.reduce(
    (sum, record) => sum + record.visitors.demographics.children,
    0
  );
  const totalMale = visitorData.reduce(
    (sum, record) => sum + record.visitors.demographics.male,
    0
  );
  const totalFemale = visitorData.reduce(
    (sum, record) => sum + record.visitors.demographics.female,
    0
  );

  const peakHour = getDataByHour().reduce((max, current) =>
    current.totalVisitors > max.totalVisitors ? current : max
  );

  const mostPopularZone = getDataByZone().reduce((max, current) =>
    current.totalVisitors > max.totalVisitors ? current : max
  );

  return {
    totalVisitors,
    demographics: {
      adults: totalAdults,
      children: totalChildren,
      male: totalMale,
      female: totalFemale,
      adultPercentage: Math.round((totalAdults / totalVisitors) * 100),
      childrenPercentage: Math.round((totalChildren / totalVisitors) * 100),
      malePercentage: Math.round((totalMale / totalVisitors) * 100),
      femalePercentage: Math.round((totalFemale / totalVisitors) * 100),
    },
    peakHour: peakHour.hour,
    peakHourVisitors: peakHour.totalVisitors,
    mostPopularZone: mostPopularZone.zoneName,
    mostPopularZoneVisitors: mostPopularZone.totalVisitors,
    averageVisitorsPerHour: Math.round(totalVisitors / 17), // 17 horas de operación
  };
};

// Función para filtrar datos por rango de horas
export const getDataByTimeRange = (startHour, endHour) => {
  return visitorData.filter(
    (record) => record.hour >= startHour && record.hour <= endHour
  );
};

// Datos para el mapa de calor
export const getHeatmapData = () => {
  return getDataByZone().map((zone) => ({
    location: zone.coordinates,
    intensity: zone.totalVisitors,
    zone: zone.zoneName,
  }));
};

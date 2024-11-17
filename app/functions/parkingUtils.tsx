import zonas from '../../constants/ParkingZones/zonas';

type LatLng = { latitude: number; longitude: number };

interface Zona {
  color: string;
  horario: string;
  dias: string[];
  horarioInicio: string;
  horarioFin: string;
  coordenadas: { latitude: number; longitude: number }[];
}

// Agrupamos las zonas por horario
const zonasPorHorario: { [horario: string]: Zona[] } = zonas.reduce((acc, zona) => {
  acc[zona.horario] = acc[zona.horario] ? [...acc[zona.horario], zona] : [zona];
  return acc;
}, {} as { [horario: string]: Zona[] });

// Función para verificar si el horario actual coincide con el horario de la zona
function esHorarioValido(diasPermitidos: string[], horarioInicio: string, horarioFin: string): boolean {
  const ahora = new Date();
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const diaActual = diasSemana[ahora.getDay()];
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();  // Convierte la hora a minutos para la comparación
  // Convertimos los horarios de inicio y fin a minutos
  const [horaInicio, minutoInicio] = horarioInicio.split(":").map(Number);
  const [horaFin, minutoFin] = horarioFin.split(":").map(Number);
  const inicioEnMinutos = horaInicio * 60 + minutoInicio;
  const finEnMinutos = horaFin * 60 + minutoFin;

  // Verifica si el día actual está en los días permitidos
  if (!diasPermitidos.includes(diaActual)) {
    return false;
  }

  // Verifica si la hora actual está dentro del horario permitido
  return horaActual >= inicioEnMinutos && horaActual <= finEnMinutos;
}

function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  const { latitude, longitude } = point;
  
  // Itera sobre cada lado del polígono
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude, yi = polygon[i].longitude;
    const xj = polygon[j].latitude, yj = polygon[j].longitude;

    // Verifica si el punto está dentro de la línea horizontal del polígono
    const intersect = ((yi > longitude) !== (yj > longitude)) && 
                      (latitude < (xj - xi) * (longitude - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Función para verificar si una ubicación está dentro de una zona específica
export const isInZone = (latitude: number, longitude: number): { horario: string; zona: Zona; mensaje: string; horarioFin: string } | null => {
  for (const [horario, zonas] of Object.entries(zonasPorHorario)) {
    for (const zona of zonas) {
      const coordenadasPoligono: LatLng[] = zona.coordenadas.map(punto => ({ latitude: punto.latitude, longitude: punto.longitude }));
      const puntoUsuario = { latitude, longitude };

      // Verifica si el punto está dentro del polígono
      const isInside = isPointInPolygon(puntoUsuario, coordenadasPoligono);

      if (isInside) {
        // Verifica si el horario actual es válido
        const enHorario = esHorarioValido(zona.dias, zona.horarioInicio, zona.horarioFin);

        let mensaje = "";
        if (zona.horario === "Prohibido estacionar") {
          mensaje = "No se puede estacionar en esta zona.";
        } else if (enHorario) {
          mensaje = "Debe pagar para estacionar en esta zona.";
        } else {
          mensaje = "Es un horario libre para estacionar.";
        }

        return { horario, zona, mensaje, horarioFin: zona.horarioFin };
      }
    }
  }
  return null;
};

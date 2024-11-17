export type RootStackParamList = {
  index: { 
    carLatitude: number; 
    carLongitude: number;
    alarmData?: { notificationId: string | null } | null; 
    fromParkMarker: boolean;
  };
  ParkMarker: undefined;
};
export type DriverAssignmentStatus = 'Offen' | 'In Bearbeitung' | 'Erledigt';

export interface DriverAssignment {
  id: string;
  assignmentNumber: string;
  driverId: string;
  animalId: string;
  animalName: string;
  animalSpecies: string;
  date: string;
  time: string;
  pickupLocation: string;
  destination: string;
  transportNotes: string;
  status: DriverAssignmentStatus;
}

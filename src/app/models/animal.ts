export interface AnimalCost {
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface AnimalReceipt {
  id: string;
  description: string;
  amount: number;
  date: string;
  assigned: boolean;
}

export interface AnimalTransport {
  driverId: string;
  pickupLocation: string;
  destination: string;
  notes: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  age: string;
  photoUrl: string;
  fosterHomeId: string | null;
  status: string;
  weightKg: number;
  notes: string;
  healthInformation: string;
  medicalInformation: string;
  placementStatus: string;
  costs: AnimalCost[];
  receipts: AnimalReceipt[];
  transport: AnimalTransport | null;
}

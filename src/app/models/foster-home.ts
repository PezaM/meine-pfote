export interface FosterHomeCost {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface FosterHome {
  id: string;
  name: string;
  contactName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  available: boolean;
  status: 'Aktiv' | 'Pausiert';
  costs: FosterHomeCost[];
}

export type FosterHomeUpdate = Partial<
  Pick<
    FosterHome,
    'name' | 'contactName' | 'location' | 'address' | 'phone' | 'email' | 'capacity' | 'available' | 'status'
  >
>;

export const INITIAL_FOSTER_HOMES: FosterHome[] = [
  {
    id: 'sonnenhof',
    name: 'Pflegestelle Sonnenhof',
    contactName: 'Mila Pfote',
    location: 'Linz',
    address: 'Sonnenweg 12, 4020 Linz',
    phone: '+43 732 555 120',
    email: 'sonnenhof@meine-pfote.test',
    capacity: 3,
    available: true,
    status: 'Aktiv',
    costs: [{ id: 'home-cost-1', description: 'Spezialfutter', amount: 38.5, date: '20. Nov.' }],
  },
  {
    id: 'pfoten-zuhause',
    name: 'Pfoten-Zuhause Müller',
    contactName: 'Familie Müller',
    location: 'Hagenberg',
    address: 'Gartenstraße 8, 4232 Hagenberg',
    phone: '+43 7236 555 208',
    email: 'mueller@meine-pfote.test',
    capacity: 2,
    available: false,
    status: 'Aktiv',
    costs: [],
  },
  {
    id: 'katzenhilfe-park',
    name: 'Katzenhilfe am Park',
    contactName: 'Sabine Berger',
    location: 'Linz',
    address: 'Parkallee 4, 4040 Linz',
    phone: '+43 732 555 441',
    email: 'katzenhilfe@meine-pfote.test',
    capacity: 4,
    available: true,
    status: 'Aktiv',
    costs: [],
  },
  {
    id: 'hof-hoffnung',
    name: 'Hof Hoffnung',
    contactName: 'Thomas Leitner',
    location: 'Leonding',
    address: 'Hofgasse 21, 4060 Leonding',
    phone: '+43 732 555 634',
    email: 'hoffnung@meine-pfote.test',
    capacity: 5,
    available: false,
    status: 'Pausiert',
    costs: [],
  },
];

export const FOSTER_HOME_NAMES: Readonly<Record<string, string>> = Object.fromEntries(
  INITIAL_FOSTER_HOMES.map(({ id, name }) => [id, name]),
);

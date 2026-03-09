export interface BookingState {
  step: number;
  partySize: number;
  services: Record<number, string[]>; // guestIndex -> array of service IDs
  date: Date | null;
  timeSlot: string | null;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // minutes
  price: number;
  description: string;
}

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Signature Haircut",
    category: "Hair",
    duration: 60,
    price: 85,
    description: "Includes consultation, wash, cut, and blow-dry styling.",
  },
  {
    id: "s2",
    name: "Deep Tissue Massage",
    category: "Spa",
    duration: 90,
    price: 120,
    description: "Intense pressure massage focusing on deeper muscle layers.",
  },
  {
    id: "s3",
    name: "Classic Manicure",
    category: "Nails",
    duration: 45,
    price: 45,
    description: "Nail shaping, cuticle care, hand massage, and polish.",
  },
  {
    id: "s4",
    name: "Balayage Color",
    category: "Hair",
    duration: 150,
    price: 220,
    description: "Hand-painted highlights for a natural, sun-kissed look.",
  },
  {
    id: "s5",
    name: "Express Facial",
    category: "Spa",
    duration: 30,
    price: 65,
    description: "Quick refresh including cleanse, exfoliation, and mask.",
  },
];

export const generateTimeSlots = () => {
  return [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
    "02:00 PM", "03:00 PM", "03:30 PM", "04:00 PM"
  ];
};

export interface Resource {
  id: string;
  name: string;
  type: "LECTURE_HALL" | "LAB" | "MEETING_ROOM" | "EQUIPMENT";
  capacity: number | null;
  location: string;
  status: "ACTIVE" | "OUT_OF_SERVICE";
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  category: "ELECTRICAL" | "PLUMBING" | "IT_EQUIPMENT" | "FURNITURE" | "HVAC" | "OTHER";
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  assignedTo?: string;
  assignedName?: string;
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  comments: Comment[];
  resolutionNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING" | "TICKET" | "COMMENT" | "SYSTEM";
  read: boolean;
  createdAt: string;
  link?: string;
}

export const resources: Resource[] = [
  { id: "r1", name: "Main Auditorium", type: "LECTURE_HALL", capacity: 500, location: "Building A, Floor 1", status: "ACTIVE", availableFrom: "07:00", availableTo: "21:00", description: "Large auditorium with stage, projector, and surround sound." },
  { id: "r2", name: "Computer Lab 201", type: "LAB", capacity: 40, location: "Building B, Floor 2", status: "ACTIVE", availableFrom: "08:00", availableTo: "20:00", description: "40 workstations with high-spec PCs and dual monitors." },
  { id: "r3", name: "Board Room", type: "MEETING_ROOM", capacity: 16, location: "Admin Block, Floor 3", status: "ACTIVE", availableFrom: "08:00", availableTo: "18:00", description: "Executive meeting room with video conferencing." },
  { id: "r4", name: "Physics Lab", type: "LAB", capacity: 30, location: "Building C, Floor 1", status: "OUT_OF_SERVICE", availableFrom: "08:00", availableTo: "17:00", description: "Currently undergoing renovation. Expected back online next month." },
  { id: "r5", name: "Projector Unit #3", type: "EQUIPMENT", capacity: null, location: "IT Store, Building A", status: "ACTIVE", availableFrom: "07:00", availableTo: "21:00", description: "Epson EB-L735U laser projector, 7000 lumens." },
  { id: "r6", name: "Lecture Hall 102", type: "LECTURE_HALL", capacity: 120, location: "Building A, Floor 1", status: "ACTIVE", availableFrom: "07:00", availableTo: "21:00", description: "Mid-size lecture hall with tiered seating." },
  { id: "r7", name: "DSLR Camera Kit", type: "EQUIPMENT", capacity: null, location: "Media Centre", status: "ACTIVE", availableFrom: "08:00", availableTo: "18:00", description: "Canon EOS R5 with 24-70mm lens, tripod, and mic." },
  { id: "r8", name: "Study Room 5", type: "MEETING_ROOM", capacity: 6, location: "Library, Floor 2", status: "ACTIVE", availableFrom: "08:00", availableTo: "22:00", description: "Small group study room with whiteboard." },
];

export const bookings: Booking[] = [
  { id: "b1", resourceId: "r1", resourceName: "Main Auditorium", userId: "u1", userName: "Alex Johnson", date: "2026-04-10", startTime: "09:00", endTime: "11:00", purpose: "Guest Lecture - AI in Healthcare", attendees: 200, status: "APPROVED", createdAt: "2026-04-01T10:00:00Z" },
  { id: "b2", resourceId: "r2", resourceName: "Computer Lab 201", userId: "u1", userName: "Alex Johnson", date: "2026-04-12", startTime: "14:00", endTime: "16:00", purpose: "Programming Workshop", attendees: 35, status: "PENDING", createdAt: "2026-04-05T14:30:00Z" },
  { id: "b3", resourceId: "r3", resourceName: "Board Room", userId: "u1", userName: "Alex Johnson", date: "2026-04-08", startTime: "10:00", endTime: "12:00", purpose: "Department Meeting", attendees: 10, status: "REJECTED", reason: "Room reserved for faculty retreat.", createdAt: "2026-04-03T09:00:00Z" },
  { id: "b4", resourceId: "r6", resourceName: "Lecture Hall 102", userId: "u2", userName: "Dr. Sarah Chen", date: "2026-04-15", startTime: "13:00", endTime: "15:00", purpose: "Mid-semester Review", attendees: 100, status: "PENDING", createdAt: "2026-04-06T08:00:00Z" },
];

export const tickets: Ticket[] = [
  { id: "t1", resourceId: "r2", resourceName: "Computer Lab 201", userId: "u1", userName: "Alex Johnson", category: "IT_EQUIPMENT", description: "Workstation #12 has a flickering monitor that makes it unusable. The screen goes black every few seconds.", priority: "HIGH", status: "IN_PROGRESS", assignedTo: "u3", assignedName: "Mike Torres", contactEmail: "alex@campus.edu", images: [], comments: [
    { id: "c1", userId: "u3", userName: "Mike Torres", text: "I'll check this tomorrow morning. Likely a cable issue.", createdAt: "2026-04-06T10:00:00Z" },
  ], createdAt: "2026-04-05T09:00:00Z", updatedAt: "2026-04-06T10:00:00Z" },
  { id: "t2", resourceId: "r1", resourceName: "Main Auditorium", userId: "u1", userName: "Alex Johnson", category: "HVAC", description: "Air conditioning not working on the left side of the hall. Temperature is noticeably higher.", priority: "MEDIUM", status: "OPEN", contactEmail: "alex@campus.edu", images: [], comments: [], createdAt: "2026-04-07T11:00:00Z", updatedAt: "2026-04-07T11:00:00Z" },
  { id: "t3", resourceId: "r3", resourceName: "Board Room", userId: "u2", userName: "Dr. Sarah Chen", category: "FURNITURE", description: "Two chairs have broken armrests. Safety concern for users.", priority: "LOW", status: "RESOLVED", assignedTo: "u3", assignedName: "Mike Torres", contactEmail: "sarah.chen@campus.edu", images: [], comments: [], resolutionNotes: "Replaced both chairs with new ones from storage.", createdAt: "2026-04-02T15:00:00Z", updatedAt: "2026-04-04T16:00:00Z" },
];

export const notifications: Notification[] = [
  { id: "n1", userId: "u1", title: "Booking Approved", message: "Your booking for Main Auditorium on Apr 10 has been approved.", type: "BOOKING", read: false, createdAt: "2026-04-02T10:00:00Z", link: "/bookings" },
  { id: "n2", userId: "u1", title: "Booking Rejected", message: "Your booking for Board Room on Apr 8 was rejected: Room reserved for faculty retreat.", type: "BOOKING", read: false, createdAt: "2026-04-04T09:00:00Z", link: "/bookings" },
  { id: "n3", userId: "u1", title: "Ticket Update", message: "Mike Torres commented on your ticket for Computer Lab 201.", type: "COMMENT", read: true, createdAt: "2026-04-06T10:05:00Z", link: "/tickets" },
  { id: "n4", userId: "u1", title: "Ticket Assigned", message: "Your ticket #t1 has been assigned to Mike Torres.", type: "TICKET", read: true, createdAt: "2026-04-05T14:00:00Z", link: "/tickets" },
  { id: "n5", userId: "u2", title: "New Booking Request", message: "Alex Johnson requested to book Computer Lab 201 on Apr 12.", type: "BOOKING", read: false, createdAt: "2026-04-05T14:30:00Z", link: "/bookings" },
];

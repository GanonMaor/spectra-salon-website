import type { Employee, Appointment, WorkingHours } from "./calendarTypes";
import { startOfWeek, addDays } from "./calendarUtils";

// ── Employees ───────────────────────────────────────────────────────

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Adele Cooper",     avatar: "https://randomuser.me/api/portraits/women/44.jpg", role: "Senior Colorist",   color: "#E84393" },
  { id: "e2", name: "Liam Navarro",     avatar: "https://randomuser.me/api/portraits/men/32.jpg",   role: "Stylist",           color: "#6C5CE7" },
  { id: "e3", name: "Maya Goldstein",   avatar: "https://randomuser.me/api/portraits/women/68.jpg", role: "Color Specialist",  color: "#00B894" },
  { id: "e4", name: "Daniel Rosen",     avatar: "https://randomuser.me/api/portraits/men/75.jpg",   role: "Junior Stylist",    color: "#FDCB6E" },
  { id: "e5", name: "Noa Berkovich",    avatar: "https://randomuser.me/api/portraits/women/21.jpg", role: "Straightening Pro", color: "#6AC5C8" },
];

// ── Working Hours ───────────────────────────────────────────────────

export const WORKING_HOURS: WorkingHours[] = EMPLOYEES.flatMap((emp) =>
  [0, 1, 2, 3, 4, 5].map((dow) => ({
    employeeId: emp.id,
    dayOfWeek: dow,
    startHour: 9,
    endHour: 18,
    breakStart: 13,
    breakEnd: 14,
  }))
);

// ── Appointment generator ───────────────────────────────────────────

function appt(
  id: string,
  empId: string,
  client: string,
  service: string,
  category: Appointment["serviceCategory"],
  dayOffset: number,
  startH: number,
  startM: number,
  durationMin: number,
  status: Appointment["status"] = "confirmed",
  notes?: string,
): Appointment {
  const base = startOfWeek(new Date());
  const day = addDays(base, dayOffset);
  const start = new Date(day);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMin);
  return { id, employeeId: empId, clientName: client, serviceName: service, serviceCategory: category, start, end, status, notes };
}

export const APPOINTMENTS: Appointment[] = [
  // ── Sunday (dayOffset 0) ──
  appt("a01","e1","Michaela Stone","Root Color","Color",0,9,0,90,"confirmed"),
  appt("a02","e1","Rachel Levi","Balayage","Highlights",0,11,0,150,"in-progress"),
  appt("a03","e1","Shira Alon","Toner Fix","Toner",0,15,0,45,"confirmed"),
  appt("a04","e2","Tom Hadad","Men's Cut","Cut",0,9,30,30,"confirmed"),
  appt("a05","e2","Dana Peretz","Full Head Color","Color",0,10,30,120,"confirmed"),
  appt("a06","e2","Yael Mizrahi","Blow Dry + Style","Treatment",0,14,0,60,"completed"),
  appt("a07","e3","Liyla Cavaliny","Highlights Half","Highlights",0,9,0,120,"confirmed"),
  appt("a08","e3","Neta Gertiog","Root Lift","Toner",0,12,0,60,"confirmed"),
  appt("a09","e3","Orly Shapira","Keratin Treatment","Straightening",0,14,0,180,"in-progress"),
  appt("a10","e4","Ron Elkayam","Buzz Cut","Cut",0,9,0,30,"completed"),
  appt("a11","e4","Sapir Cohen","Color Fix","Color",0,10,0,90,"confirmed"),
  appt("a12","e5","Tamar Levy","Keratin","Straightening",0,9,0,180,"confirmed"),
  appt("a13","e5","Hila Ben David","Toner","Toner",0,14,0,45,"cancelled"),

  // ── Monday (dayOffset 1) ──
  appt("a14","e1","Noa Friedman","Full Head","Color",1,9,0,120,"confirmed"),
  appt("a15","e1","Rina Katz","Balayage","Highlights",1,12,0,150,"confirmed"),
  appt("a16","e1","Efrat Dahan","Toner Refresh","Toner",1,16,0,45,"confirmed"),
  appt("a17","e2","Yossi Malka","Men's Fade","Cut",1,9,0,45,"completed"),
  appt("a18","e2","Gili Avraham","Color Roots","Color",1,10,30,90,"confirmed"),
  appt("a19","e3","Miri Azoulay","Half Head Highlights","Highlights",1,9,0,120,"in-progress"),
  appt("a20","e3","Orit Ben Shlomo","Gloss Treatment","Treatment",1,13,0,60,"confirmed"),
  appt("a21","e4","Amit Regev","Style + Cut","Cut",1,10,0,60,"confirmed"),
  appt("a22","e4","Shani Gold","Root Touch Up","Color",1,12,0,90,"confirmed"),
  appt("a23","e5","Roni Segal","Brazilian Blowout","Straightening",1,9,0,180,"confirmed"),
  appt("a24","e5","Karen Stern","Toner","Toner",1,15,0,45,"no-show"),

  // ── Tuesday (dayOffset 2) ──
  appt("a25","e1","Dikla Mor","Balayage Touch-up","Highlights",2,9,30,120,"confirmed"),
  appt("a26","e1","Ayelet Bar","Color + Toner","Color",2,12,30,120,"confirmed"),
  appt("a27","e2","Zohar Stein","Crew Cut","Cut",2,9,0,30,"completed"),
  appt("a28","e2","Lee Chen","Vivid Fashion Color","Color",2,10,0,150,"in-progress"),
  appt("a29","e3","Romema Green","Full Head Highlights","Highlights",2,9,0,180,"confirmed"),
  appt("a30","e3","Sivan Haim","Scalp Treatment","Treatment",2,14,0,60,"confirmed"),
  appt("a31","e4","Adi Yosef","Trim + Blow Dry","Cut",2,11,0,60,"confirmed"),
  appt("a32","e5","Inbal Ozeri","Straightening","Straightening",2,9,0,180,"confirmed"),
  appt("a33","e5","Meital Rosen","Toner Fix","Toner",2,14,0,45,"confirmed"),

  // ── Wednesday (dayOffset 3) ──
  appt("a34","e1","Osnat Dvir","Full Balayage","Highlights",3,9,0,180,"confirmed"),
  appt("a35","e1","Tali Barak","Toner","Toner",3,14,0,45,"confirmed"),
  appt("a36","e2","Uri Levi","Fade + Design","Cut",3,9,0,60,"completed"),
  appt("a37","e2","Anat Koren","Roots + Gloss","Color",3,10,30,120,"confirmed"),
  appt("a38","e3","Hadas Peled","Highlights","Highlights",3,9,0,120,"in-progress"),
  appt("a39","e3","Noga Fine","Deep Conditioning","Treatment",3,12,0,60,"confirmed"),
  appt("a40","e4","Lior Shaked","Color Correction","Color",3,9,0,180,"confirmed"),
  appt("a41","e5","Ruth Nahum","Japanese Straightening","Straightening",3,9,0,240,"confirmed"),

  // ── Thursday (dayOffset 4) ──
  appt("a42","e1","Ella Margalit","Ombre","Highlights",4,9,0,150,"confirmed"),
  appt("a43","e1","Sigal Weiss","Root Refresh","Color",4,14,0,90,"confirmed"),
  appt("a44","e2","Ben Tzvi","Classic Cut","Cut",4,9,30,45,"completed"),
  appt("a45","e2","Shelly Amar","Creative Color","Color",4,11,0,120,"confirmed"),
  appt("a46","e3","Pnina Harel","Baby Lights","Highlights",4,9,0,180,"in-progress","VIP client, extra care"),
  appt("a47","e4","Yaniv Dror","Quick Trim","Cut",4,9,0,30,"confirmed"),
  appt("a48","e4","Tal Sasson","Toner + Style","Toner",4,10,0,75,"confirmed"),
  appt("a49","e5","Lilach Eden","Keratin Express","Straightening",4,9,0,120,"confirmed"),
  appt("a50","e5","Yarden Paz","Full Straightening","Straightening",4,13,0,180,"confirmed"),

  // ── Friday (dayOffset 5) ──
  appt("a51","e1","Nirit Shoham","Bridal Color","Color",5,9,0,120,"confirmed","Bride - wedding tomorrow"),
  appt("a52","e1","Ahuva Klein","Quick Toner","Toner",5,12,0,30,"confirmed"),
  appt("a53","e2","Dror Kaplan","Groom's Cut","Cut",5,9,0,45,"confirmed"),
  appt("a54","e3","Carmel Lux","Highlight Touch-up","Highlights",5,9,0,90,"confirmed"),
  appt("a55","e4","Liora Ben Ami","Roots","Color",5,9,0,60,"confirmed"),
  appt("a56","e5","Bat-El Nissim","Keratin","Straightening",5,9,0,150,"confirmed"),
];

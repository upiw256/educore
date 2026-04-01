// src/constants/menu.ts

export interface MenuItem {
  title: string;
  path: string;
  iconName: string;
  roles?: string[];
}

export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

export const menuData: MenuSection[] = [
  {
    items: [
      { title: "Dashboard", path: "/admin/dashboard", iconName: "dashboard" },
      { title: "Data Siswa", path: "/admin/siswa", iconName: "siswa", roles: ["admin"] },
      { title: "Data Guru", path: "/admin/guru", iconName: "guru", roles: ["admin"] },
      { title: "Jadwal", path: "/admin/jadwal", iconName: "jadwal", roles: ["admin"] },
    ]
  },
  {
    label: "Piket",
    items: [
      { title: "Siswa Terlambat", path: "/admin/piket/terlambat", iconName: "late", roles: ["admin", "piket"] },
      { title: "Izin Masuk / Keluar", path: "/admin/piket/izin", iconName: "permission", roles: ["admin", "piket"] },
    ]
  },
  {
    label: "Kesiswaan",
    items: [
      { title: "Pelanggaran", path: "/admin/kesiswaan/pelanggaran", iconName: "violation", roles: ["admin", "kesiswaan"] },
    ]
  },
  {
    label: "Sistem",
    items: [
      { title: "Manajemen User", path: "/admin/settings/users", iconName: "settings", roles: ["admin"] },
      { title: "Profile", path: "/admin/settings/profile", iconName: "logout" }
    ]
  }
];
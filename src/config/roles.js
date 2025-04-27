// Definición centralizada de roles para todas las páginas
export const PAGE_ROLES = {
  dashboard: ["super-admin", "admin", "editor", "moderator", "viewer"],
  home: ["super-admin", "admin", "editor", "moderator", "viewer"],
  appointments: ["super-admin", "admin", "moderator", "viewer"],
  doctorsManagement: ["super-admin", "admin", "viewer"],
  servicesManagement: ["super-admin", "admin", "viewer"],
  siteSettings: ["super-admin", "admin", "viewer"],
  blogManagement: ["super-admin", "admin", "editor", "viewer"],
  contactMessages: ["super-admin", "admin", "moderator", "viewer"],
  analytics: ["super-admin", "admin", "editor", "moderator", "viewer"],
  testimonials: ["super-admin", "admin", "moderator", "viewer"],
  adminsManagement: ["super-admin", "viewer"],
  usersManagement: ["super-admin", "viewer"],
};

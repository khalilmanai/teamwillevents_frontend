export const ROLES = {
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]


export const roleRoutes = {
  manager: {
    dashboard: "/manager",
    profile: "/manager/profile",
    default: "/manager",
    createEvent:"/manager/events/create",
    draft : "/manager/events/draft",
    tasks : "/manager/tasks",
    analytics: "/manager/analytics"
  },
  employee: {
    dashboard: "/employee",
    profile: "/employee/profile",
    default: "/employee",
    registrations: "/employee/registrations",
    tasks:"/employee/tasks"
  },
} as const;

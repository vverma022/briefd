export const sendersKeys = {
  all: ["senders"] as const,
}

export const onboardingKeys = {
  newsletters: ["newsletters"] as const,
}

export const profileKeys = {
  all: ["profile"] as const,
}

export const digestKeys = {
  all: ["digests"] as const,
  lists: () => [...digestKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...digestKeys.lists(), params] as const,
  detail: (id: string) => [...digestKeys.all, "detail", id] as const,
}

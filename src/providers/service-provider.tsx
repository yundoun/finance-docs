"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SearchPort } from "@/ports/search";
import type { ChatPort } from "@/ports/chat";
import { RestSearchAdapter } from "@/adapters/rest-search";
import { SseChatAdapter } from "@/adapters/sse-chat";

interface Services {
  search: SearchPort;
  chat: ChatPort;
}

const defaultServices: Services = {
  search: new RestSearchAdapter(),
  chat: new SseChatAdapter(),
};

const ServiceContext = createContext<Services>(defaultServices);

export function ServiceProvider({
  children,
  search,
  chat,
}: {
  children: ReactNode;
  search?: SearchPort;
  chat?: ChatPort;
}) {
  const value: Services = {
    search: search ?? defaultServices.search,
    chat: chat ?? defaultServices.chat,
  };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
}

export function useServices() {
  return useContext(ServiceContext);
}

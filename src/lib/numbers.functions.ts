import { createServerFn } from "@tanstack/react-start";
import { getSiteConfig, updateSiteConfig } from "./admin-layout.functions";

export const getNumbersConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    return getSiteConfig({ data: "aprender_numeros" });
  });

export const updateNumbersConfig = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    return updateSiteConfig({ data: { key: "aprender_numeros", value: data } });
  });

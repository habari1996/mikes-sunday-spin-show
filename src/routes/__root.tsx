import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

const APP_NAME = "MIKE'S — Lusaka Spin Show";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Drift and spin Mike's Car Wash on Kafue Road, Lusaka. King Katra, Sam Sam, Wababa. Spin Flex Repeat.",
      },
      { name: "theme-color", content: "#0b0a09" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});

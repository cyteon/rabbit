/** @type {import('tailwindcss').Config} */
import catppuccin from "@catppuccin/tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            marginTop: "0",
            marginBottom: "0",
            color: "#cdd6f4",
            a: { color: "#89b4fa" },
            h1: { color: "#cdd6f4", marginBottom: "0", lineHeight: "1.2" },
            h2: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            h3: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            h4: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            h5: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            h6: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            em: { color: "#cdd6f4", marginBottom: "0", marginTop: "0" },
            ol: { margin: "0", padding: "0" },
            th: { color: "#cdd6f4" },
            blockquote: { color: "#cdd6f4" },
            code: { color: "#bac2de", backgroundColor: "#181825" },
            pre: { color: "#cdd6f4", backgroundColor: "#181825" },
            bold: { color: "#cdd6f4" },
            strong: { color: "#cdd6f4" },
          },
        },
      }),
    },
  },
  plugins: [
    catppuccin({
      // prefix to use, e.g. `text-pink` becomes `text-ctp-pink`.
      // default is `false`, which means no prefix
      prefix: "ctp",
      // which flavour of colours to use by default, in the `:root`
      defaultFlavour: "mocha",
    }),
    typography,
  ],
};

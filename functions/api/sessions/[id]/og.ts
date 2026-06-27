import { ImageResponse } from "@cf-wasm/og/workerd";

interface Env {
  DB: D1Database;
}

async function fetchFont(): Promise<ArrayBuffer> {
  return fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff"
  ).then((r) => r.arrayBuffer());
}

export const onRequestGet: PagesFunction<Env, "id"> = async (context) => {
  const db = context.env.DB;
  const id = context.params.id as string;

  const session = await db
    .prepare("SELECT title FROM sessions WHERE id = ?")
    .bind(id)
    .first<{ title: string }>();

  const title = session?.title ?? "投票";
  const fontData = await fetchFont();

  const element = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        background: "#3D8C28",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Noto Sans JP",
        padding: "36px",
        boxSizing: "border-box",
      },
      children: {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            background: "white",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            boxSizing: "border-box",
          },
          children: [
            {
              type: "p",
              props: {
                style: {
                  fontSize: title.length > 20 ? "56px" : "72px",
                  fontWeight: "700",
                  color: "#333",
                  margin: "0",
                  lineHeight: "1.4",
                  textAlign: "center",
                  wordBreak: "break-word",
                },
                children: title,
              },
            },
            {
              type: "p",
              props: {
                style: {
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#69B040",
                  marginTop: "auto",
                },
                children: "投票さん",
              },
            },
          ],
        },
      },
    },
  };

  const response = new ImageResponse(element as unknown as React.ReactElement, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Noto Sans JP",
        data: fontData,
        style: "normal" as const,
        weight: 700,
      },
    ],
  });

  response.headers.set("Cache-Control", "public, max-age=86400");
  return response;
};

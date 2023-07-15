"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState([]);

  const fileHandler = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      readPDF(event.target.result);
    };

    reader.readAsArrayBuffer(file);
  };

  const readPDF = (buffer: any) => {
    const loadingTask = pdfjsLib.getDocument(buffer);
    loadingTask.promise.then(function (pdf) {
      pdf.getPage(1).then(async function (page) {
        const textContent = await page.getTextContent();
        const lines = textContent.items.map((item) => item.str);
        console.log(lines)
        setContent(lines);
      });
    });
  };

  return (
    <main>
      <div style={{ maxWidth: 1080, margin: "100px auto" }}>
        <input type="file" onChange={fileHandler} />
        <div>
          {content.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </main>
  );
}

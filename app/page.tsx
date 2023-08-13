"use client";

import { useState, useEffect } from "react";
import Electronica from "../data/electronica";

export default function Home() {
  const [content, setContent] = useState<string[]>([]);

  const fileHandler = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      if (!event.target) {
        return;
      }

      readPDF(event.target.result);
    };

    reader.readAsArrayBuffer(file);
  };

  const readPDF = async (buffer: any) => {
    // @ts-ignore
    const loadingTask = pdfjsLib.getDocument(buffer);
    loadingTask.promise.then((pdf: any) => {
      for (let i = 1; i <= pdf.numPages; i += 1) {
        pdf.getPage(i).then(async (page: any) => {
          const textContent = await page.getTextContent();
          const lines = textContent.items.map((item: any) => item.str);
          setContent([...content, ...lines]);
        });
      }
    });
  };

  useEffect(() => {
    console.log(content);
  }, [content]);

  return (
    <main>
      <div style={{ maxWidth: 1080, margin: "100px auto" }}>
        <input type="file" onChange={fileHandler} />
        <div>
          {content.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>

        <div style={{ marginTop: 200, display: "flex" }}>
          {Electronica.map((semester, index) => (
            <div key={`semester_${index}`}>
              {semester.courses.map(
                (course: {
                  name: string;
                  code: number;
                  optional?: boolean;
                }) => (
                  <div
                    key={index}
                    style={{
                      width: 150,
                      height: 150,
                      margin: 12,
                      border: "1px solid black",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      backgroundColor: course.optional ? "#EEE" : "",
                    }}
                  >
                    <div>
                      <div>{course.name}</div>

                      <div>{course.code}</div>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

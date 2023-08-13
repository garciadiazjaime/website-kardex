"use client";

import { useState, useEffect } from "react";
import Electronica from "../data/electronica";

interface IGrades {
  [key: string]: string;
}

interface ICourse {
  name: string;
  code: number;
  optional?: boolean;
}

export default function Home() {
  const [content, setContent] = useState<string[]>([]);
  const [grades, setGrades] = useState<IGrades>({});

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

  const initGrades = () => {
    const courseRegex = /^\d{5}$/;
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;

    const _grades: IGrades = {};

    for (let i = 0; i < content.length; i += 1) {
      const line = content[i];
      if (courseRegex.test(line)) {
        const course = line;

        for (let j = i + 1; j < content.length; j += 1) {
          const line = content[j];

          if (dateRegex.test(line)) {
            _grades[course] = content[j - 2];
            break;
          }
        }
      }
    }
    setGrades({ ...grades, ..._grades });
  };

  useEffect(() => {
    initGrades();
  }, [content]);

  const styles = {
    colors: {
      primary: "#006733",
      secondary: "#f1a631",
      gray: "#565451",
      gray800: "#EEE",
    },
    container: {
      maxWidth: 1080,
      margin: "0 auto",
    },
  };

  const getColor = (course: ICourse) => {
    if (grades[course.code]) {
      return parseInt(grades[course.code]) >= 60
        ? styles.colors.primary
        : "red";
    }

    return course.optional ? styles.colors.gray800 : "";
  };

  return (
    <main>
      <header
        style={{
          borderBottom: `4px solid ${styles.colors.secondary}`,
          padding: "20px 0",
          margin: "0 0 40px 0",
        }}
      >
        <div style={styles.container}>
          <h1 style={{ color: styles.colors.primary, fontWeight: "bold" }}>
            UABC | Ingeniero en Electrónica | Plan 2020-1
          </h1>
        </div>
      </header>

      <div style={{ ...styles.container, padding: "0 0 60px 0" }}>
        <div style={{ padding: 6, cursor: "pointer" }}>
          <label
            htmlFor="files"
            style={{ display: "inline-block", paddingRight: 20 }}
          >
            Selecciona tu Kardex:{" "}
          </label>
          <input id="files" type="file" onChange={fileHandler} />
        </div>
      </div>

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          overflow: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          {Electronica.map((semester, index) => (
            <div key={`semester_${semester.name}`}>
              {semester.courses.map((course: ICourse) => (
                <div
                  key={course.code}
                  style={{
                    width: (1080 - 12 * 8) / 8,
                    height: (1080 - 12 * 8) / 8,
                    margin: 6,
                    border: "1px solid black",
                    backgroundColor: getColor(course),
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        wordBreak: "break-word",
                        fontSize: ".9em",
                        padding: 2,
                      }}
                    >
                      {course.name}
                    </div>

                    <div>{course.code}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

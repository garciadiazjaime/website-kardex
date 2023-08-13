"use client";

import { useState, useEffect } from "react";
import Electronica from "../data/electronica";

export default function Home() {
  const [content, setContent] = useState<string[]>([]);
  const [grades, setGrades] = useState({});

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

    const _grades = {};

    for (let i = 0; i < content.length; i += 1) {
      const line = content[i];
      if (courseRegex.test(line)) {
        const course = line

        for (let j = i+1; j < content.length; j += 1) {
          const line = content[j];

          if (dateRegex.test(line)) {
            _grades[course] = content[j - 2];
            break
          }
        }
        
      }
    }
    setGrades({...grades, ..._grades });
  }

  useEffect(() => {
    initGrades()
  }, [content]);

  const getColor = (course) => {
    if (grades[course.code]) {
      return grades[course.code] >= 60 ? "green" : "red";
    }

    return course.optional ? "#EEE" : "";
  };

  return (
    <main>
      <div style={{ maxWidth: 1080, margin: "100px auto" }}>
        <input type="file" onChange={fileHandler} />

        <div style={{ marginTop: 200, display: "flex" }}>
          {Electronica.map((semester, index) => (
            <div key={`semester_${semester.name}`}>
              {semester.courses.map(
                (course: {
                  name: string;
                  code: number;
                  optional?: boolean;
                }) => (
                  <div
                    key={course.code}
                    style={{
                      width: 150,
                      height: 150,
                      margin: 12,
                      border: "1px solid black",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      backgroundColor: getColor(course),
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

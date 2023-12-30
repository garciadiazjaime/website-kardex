"use client";

import { useState, useEffect } from "react";
import TagManager from "react-gtm-module";
import async from "async";

import Electronica from "../data/electronica";

import animationStyles from "./animation.module.css";

interface IGrades {
  [key: string]: string;
}

interface ICourse {
  name: string;
  code: number;
  optional?: boolean;
  credits: number;
}

export default function Home() {
  const [content, setContent] = useState<string[]>([]);
  const [grades, setGrades] = useState<IGrades>({});
  const [finalGrades, setFinalGrades] = useState<IGrades>({});
  const [semesterReviewing, setSemesterReviewing] = useState<number>(1);
  const [showAnimation, setShowAnimation] = useState(false);

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
    loadingTask.promise.then(async (pdf: any) => {
      const pages = Array.from({ length: pdf.numPages }, (v, i) => i);
      await async.eachSeries(pages, async (i: number) => {
        const page = await pdf.getPage(i + 1);

        const textContent = await page.getTextContent();
        const lines = textContent.items.map((item: any) => item.str);

        setContent([...content, ...lines]);
      });
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

  const animation = () => {
    if (!showAnimation) {
      return;
    }

    if (semesterReviewing > 8) {
      setShowAnimation(false);
      setSemesterReviewing(1);
      return;
    }

    setTimeout(() => {
      setSemesterReviewing(semesterReviewing + 1);
    }, 1 * 1000);
  };

  const setFinalesGradesForSemester = (semester: number) => {
    if (semester === 0) {
      return;
    }

    const _finalGrades: IGrades = {};

    Electronica[semester - 1].courses.map((course) => {
      if (grades[course.code]) {
        _finalGrades[course.code] = grades[course.code];
      }
    });

    setFinalGrades({ ...finalGrades, ..._finalGrades });
  };

  const getColor = (course: ICourse) => {
    if (finalGrades[course.code]) {
      return parseInt(finalGrades[course.code]) >= 60
        ? styles.colors.primary
        : "red";
    }

    return course.optional ? styles.colors.gray800 : "";
  };

  const initGTag = () => {
    const tagManagerArgs = {
      gtmId: "GTM-PPJ3BH23",
    };

    TagManager.initialize(tagManagerArgs);
  };

  useEffect(() => {
    initGrades();
  }, [content]);

  useEffect(() => {
    if (Object.keys(grades).length === 0 || showAnimation === true) {
      return;
    }

    setShowAnimation(true);
  }, [grades]);

  useEffect(() => {
    setFinalesGradesForSemester(semesterReviewing - 1);
    animation();
  }, [semesterReviewing, showAnimation]);

  useEffect(() => {
    initGTag();
  }, []);

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
          {Electronica.map((semester) => (
            <div key={`semester_${semester.name}`}>
              <div
                style={{ borderBottom: "1px solid black", textAlign: "center" }}
              >
                {semester.name}
              </div>
              {semester.courses.map((course: ICourse) => (
                <div
                  key={course.code}
                  style={{
                    width: (1080 - 12 * 8) / 8,
                    height: (1080 - 12 * 8) / 8,
                    margin: "12px 6px",
                    border: "1px solid black",
                    backgroundColor: getColor(course),
                    opacity: 0.8,
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  className={
                    showAnimation && semester.name === semesterReviewing
                      ? animationStyles.pulse
                      : ""
                  }
                >
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
                  <div
                    style={{
                      position: "absolute",
                      right: 6,
                      bottom: 0,
                      fontWeight: "bold",
                    }}
                  >
                    {course.credits}
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

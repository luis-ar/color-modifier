"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const svgUrl =
    "https://ik.imagekit.io/m5f5k3axy/svg-2.svg?updatedAt=1718080233270";

  const [imageUrl, setImageUrl] = useState<string>(svgUrl);
  const [colors, setColors] = useState<{ id: string; color: string }[]>([]);
  const [svgContent, setSvgContent] = useState<string>("");
  const [search, setSearch] = useState<boolean>(false);
  useEffect(() => {
    const fetchSVG = async () => {
      if (search || imageUrl !== "") {
        try {
          setImageUrl("");

          const response = await fetch(imageUrl);
          let svgText = await response.text();
          svgText = addDimensionsToSVG(svgText);

          setSvgContent(svgText);
          extractColorsFromSVG(svgText);
          setSearch(false);
        } catch (error) {
          console.error("Error fetching SVG:", error);
        }
      }
    };
    const addDimensionsToSVG = (svgText: string): string => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      svgElement.setAttribute("width", "300");
      svgElement.setAttribute("height", "300");

      return svgDoc.documentElement.outerHTML;
    };

    const extractColorsFromSVG = (svgCode: string) => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgCode, "image/svg+xml");
      const pathElements = svgDoc.querySelectorAll("path");

      const colorsData: { id: string; color: string }[] = [];
      const colorClassMap: { [key: string]: string } = {};

      pathElements.forEach((path, index) => {
        const fillColor = path.getAttribute("fill");

        if (fillColor) {
          const key = `${fillColor}`;
          let id = colorClassMap[key];

          if (!id) {
            id = `path-color-${index}`;
            colorClassMap[key] = id;
          }

          path.setAttribute("id", id);

          const existingColorData = colorsData.find(
            (colorData) => colorData.id === id
          );

          if (!existingColorData) {
            colorsData.push({ id, color: fillColor });
          }
        }
      });
      setColors(colorsData);
      setSvgContent(svgDoc.documentElement.outerHTML);
    };

    fetchSVG();
  }, [search]);

  const handleColorChange = (e: any, id: string) => {
    const newColor = e.target.value;

    setColors((prevColors) =>
      prevColors.map((colorData) =>
        colorData.id === id ? { ...colorData, color: newColor } : colorData
      )
    );

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const pathElements = svgDoc.querySelectorAll(`#${id}`);

    pathElements.forEach((pathElement) => {
      if (pathElement) {
        pathElement.setAttribute("fill", newColor);
      }
    });

    setSvgContent(svgDoc.documentElement.outerHTML);
  };

  const handleImageChange = (e: any) => {
    e.preventDefault();
    const newImageUrl = e.target.value;
    setImageUrl(newImageUrl);
  };
  const hadlesubmit = (e: any) => {
    e.preventDefault();
    setSearch(true);
  };
  return (
    <>
      <div>
        <form onSubmit={hadlesubmit}>
          <h2>URL IMAGE</h2>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => handleImageChange(e)}
          />
          <input
            type="submit"
            value={"Search Image"}
            className="cursor-pointer pl-3"
          />
        </form>

        <h2>Color Palette</h2>
        <div>
          {colors.length > 0 ? (
            colors.map((colorData, index) => (
              <div key={index}>
                <label>Color {index + 1}: </label>
                <input
                  type="color"
                  value={colorData.color}
                  style={{ marginLeft: "10px" }}
                  onChange={(e) => handleColorChange(e, colorData.id)}
                />
              </div>
            ))
          ) : (
            <div>Loading...</div>
          )}
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="w-[300px] h-[300px] "
        />
      </div>
    </>
  );
}

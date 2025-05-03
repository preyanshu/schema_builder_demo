import { useEffect } from "react";

const SPECIAL_SUFFIXES = new Set(["ui:description", "ui:title", "ui:help"]);

export default function useScrollToField(fieldPath: string[]) {
  useEffect(() => {
    console.log("[useScrollToField] fieldPath", fieldPath);

    const makeId = (segments: string[]) => {
      const last = segments[segments.length - 1];

      // Check original fieldPath before cleaning (preserves ui: prefix)
      if (SPECIAL_SUFFIXES.has(last)) {
        console.log(`[useScrollToField] special suffix detected: ${last}`);

        const baseSegments = segments.slice(0, -1);
        const base = baseSegments
          .map((seg) => seg.replace(/^ui:/, "").replace(/\[(\d+)\]/, "_$1"))
          .join("_");

        const suffix = last.replace(/^ui:/, "");

        return base ? `root_${base}__${suffix}` : `root__${suffix}`;
      }

      // Normal case: clean whole path
      return (
        "root_" +
        segments
          .map((seg) => seg.replace(/^ui:/, "").replace(/\[(\d+)\]/, "_$1"))
          .join("_")
      );
    };

    for (let i = fieldPath.length; i > 0; i--) {
      const segs = fieldPath.slice(0, i);
      const id = makeId(segs);
      const el = document.getElementById(id);

      console.log(`[useScrollToField] trying id=${id}`, el);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  }, [fieldPath.join(".")]);
}

export const getNodeByPath = (schema: any, pathArray: string[]) =>
    pathArray.reduce((acc, seg) => (acc ? acc[seg] : undefined), schema);